package com.jackpot.narratix.domain.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.exception.VersionConflictException;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

/**
 * 텍스트 변경 델타를 Redis에 관리한다.
 *
 * <h3>버저닝</h3>
 * <p>버전 카운터는 세션 시작 시 {@link #initVersionIfAbsent}로 DB 버전으로 초기화된다.
 * 이후 {@link #pushAndIncrVersion}이 RPUSH + INCR을 원자적으로 실행해 DB 조회 없이 절대 버전을 반환한다.
 * committed 목록은 오래된 버전을 보고 있는 Reviewer가 OT를 수행할 때 활용된다.</p>
 */
@Slf4j
@Repository
@RequiredArgsConstructor
public class TextDeltaRedisRepository {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String PENDING_KEY_FORMAT = "qna:text-delta:pending:%d"; // 아직 DB에 반영되지 않은 델타
    private static final String COMMITTED_KEY_FORMAT = "qna:text-delta:committed:%d"; // DB에 반영된 델타 (OT 히스토리용)
    private static final String VERSION_KEY_FORMAT = "qna:text-delta:version:%d"; // 절대 버전 카운터. 세션 시작 시 QnA.version으로 초기화되며, delta push마다 INCR.

    static final int MAX_COMMITTED_SIZE = 100;

    /** 세션 비정상 종료 등으로 cleanup이 실행되지 않을 경우를 대비한 키 만료 시간 */
    static final Duration KEY_TTL = Duration.ofDays(14);
    private static final long KEY_TTL_SECONDS = KEY_TTL.getSeconds();

    /**
     * 버전 검증 + RPUSH(pending) + INCR(version) 원자적 실행 Lua 스크립트.
     *
     * <p>ARGV[2](클라이언트 예상 버전)가 현재 카운터와 일치할 때만 push를 수행한다.
     * 불일치 시 RPUSH/INCR 없이 -1을 반환해 버전 충돌을 알린다.</p>
     *
     * pending 키 TTL은 각 배치의 첫 push 시 {@link #refreshPendingTtl}로 1회 설정되고,
     * flush(pending 삭제) 후 다음 첫 push 때 재설정된다.</p>
     *
     * KEYS: [pendingKey, versionKey]
     * ARGV: [deltaJson, expectedVersion]
     * 반환값: 버전 일치 → INCR 후 카운터(= 이 델타의 절대 버전) / 불일치 → -1
     */
    private static final String PUSH_AND_INCR_SCRIPT = """
            local current = redis.call('get', KEYS[2])
            if current == false or tonumber(current) ~= tonumber(ARGV[2]) then
                return -1
            end
            redis.call('rpush', KEYS[1], ARGV[1])
            return redis.call('incr', KEYS[2])
            """;

    private static final DefaultRedisScript<Long> PUSH_AND_INCR_REDIS_SCRIPT =
            new DefaultRedisScript<>(PUSH_AND_INCR_SCRIPT, Long.class);

    /**
     * pending → committed 원자적 이동 Lua 스크립트.
     * LRANGE pending → RPUSH committed → LTRIM(>MAX) → EXPIRE committed → DEL pending
     * 반환값: 이동한 델타 수
     * 자세한 설명은 <a href="https://www.notion.so/jackpot-narratix/Server-OT-Flow-30b14885339b8096a06dcf3a9805ad4e#30b14885339b80ac96fff934e91160c2">COMMIT_SCRIPT Description</a> 참조
     *
     * KEYS: [pendingKey, committedKey]
     * ARGV: [maxCommittedSize, ttlSeconds, deltaCount]
     * deltaCount: getPending()으로 읽은 항목 수. 그 이후에 유입된 델타는 pending에 보존된다.
     */
    private static final String COMMIT_SCRIPT = """
            local count = tonumber(ARGV[3])
            local items = redis.call('lrange', KEYS[1], 0, count - 1)
            for _, item in ipairs(items) do
                redis.call('rpush', KEYS[2], item)
            end
            local committed_size = redis.call('llen', KEYS[2])
            local max = tonumber(ARGV[1])
            if committed_size > max then
                redis.call('ltrim', KEYS[2], committed_size - max, -1)
            end
            redis.call('expire', KEYS[2], ARGV[2])
            redis.call('ltrim', KEYS[1], count, -1)
            return #items
            """;

    private static final DefaultRedisScript<Long> COMMIT_REDIS_SCRIPT =
            new DefaultRedisScript<>(COMMIT_SCRIPT, Long.class);

    /**
     * RPOP(pending) + DECR(version) 원자적 실행 Lua 스크립트.
     * pushAndIncrVersion으로 추가된 마지막 델타를 되돌린다.
     * 반환값: DECR 후 버전 카운터 값
     */
    private static final String ROLLBACK_PUSH_SCRIPT = """
            redis.call('rpop', KEYS[1])
            return redis.call('decr', KEYS[2])
            """;

    private static final DefaultRedisScript<Long> ROLLBACK_PUSH_REDIS_SCRIPT =
            new DefaultRedisScript<>(ROLLBACK_PUSH_SCRIPT, Long.class);

    private String pendingKey(Long qnAId) {
        return PENDING_KEY_FORMAT.formatted(qnAId);
    }

    private String committedKey(Long qnAId) {
        return COMMITTED_KEY_FORMAT.formatted(qnAId);
    }

    private String versionKey(Long qnAId) {
        return VERSION_KEY_FORMAT.formatted(qnAId);
    }
    
    /**
     * 버전 카운터를 {@code dbVersion}으로 초기화한다 (키가 없을 때만 설정).
     * 세션 시작 시 {@code QnA.version}을 전달해 1회 초기화하며, 이후 push마다 INCR + TTL 갱신이 수행된다.
     */
    public void initVersionIfAbsent(Long qnAId, Long dbVersion) {
        redisTemplate.opsForValue().setIfAbsent(versionKey(qnAId), String.valueOf(dbVersion), KEY_TTL);
        log.debug("버전 카운터 초기화(SETNX): qnAId={}, dbVersion={}", qnAId, dbVersion);
    }

    /**
     * 버전 카운터 키의 존재 여부를 반환한다.
     * Redis 재시작 등으로 카운터가 유실됐는지 확인하는 데 사용된다.
     */
    public boolean versionExists(Long qnAId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(versionKey(qnAId)));
    }


    /**
     * 버전 검증 후 델타를 pending List에 RPUSH하고 버전 카운터를 INCR한다 (Lua 스크립트로 원자적 실행).
     *
     * <p>{@code delta.version()}이 현재 Redis 버전 카운터와 일치해야 push가 수행된다.
     * 불일치 시 push 없이 {@link VersionConflictException}을 던진다.
     * 성공 시 pending/version 키의 TTL이 {@link #KEY_TTL}으로 갱신된다.</p>
     *
     * @return 이 델타의 절대 버전 번호
     * @throws VersionConflictException 버전 불일치 (push 미발생)
     */
    public long pushAndIncrVersion(Long qnAId, TextUpdateRequest delta) {
        long expectedVersion = delta.version();
        try {
            String json = objectMapper.writeValueAsString(delta);
            Long result = redisTemplate.execute(
                    PUSH_AND_INCR_REDIS_SCRIPT,
                    List.of(pendingKey(qnAId), versionKey(qnAId)),
                    json, String.valueOf(expectedVersion)
            );
            if (result == null || result == -1L) {
                log.warn("버전 충돌: qnAId={}, expectedVersion={}", qnAId, expectedVersion);
                throw new VersionConflictException();
            }
            return result;
        } catch (JsonProcessingException e) {
            log.error("TextUpdateRequest 직렬화 실패: qnAId={}", qnAId, e);
            throw new BaseException(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * pending 키의 TTL을 {@link #KEY_TTL}으로 설정한다.
     * flush 후 첫 번째 push 시 1회 호출해 배치당 1회만 TTL을 설정한다.
     */
    public void refreshPendingTtl(Long qnAId) {
        redisTemplate.expire(pendingKey(qnAId), KEY_TTL);
    }

    /**
     * pushAndIncrVersion으로 추가된 마지막 델타를 원자적으로 되돌린다 (RPOP + DECR).
     * saveAndMaybeFlush 실패 시 오류 복구 목적으로 사용된다.
     * pending이 비어 있는 경우 RPOP은 no-op, DECR만 수행된다.
     */
    public void rollbackLastPush(Long qnAId) {
        redisTemplate.execute(
                ROLLBACK_PUSH_REDIS_SCRIPT,
                List.of(pendingKey(qnAId), versionKey(qnAId))
        );
        log.debug("마지막 push 롤백 완료: qnAId={}", qnAId);
    }

    /**
     * DB에 반영되지 않은 pending 델타를 순서대로 반환한다.
     */
    public List<TextUpdateRequest> getPending(Long qnAId) {
        return deserializeList(qnAId, redisTemplate.opsForList().range(pendingKey(qnAId), 0, -1));
    }

    /**
     * 현재 pending 델타 수를 반환한다.
     */
    public long pendingSize(Long qnAId) {
        Long size = redisTemplate.opsForList().size(pendingKey(qnAId));
        return size != null ? size : 0L;
    }


    /**
     * pending 델타를 앞에서 {@code deltaCount}개만큼 committed로 원자적으로 이동하고
     * pending 앞부분을 LTRIM으로 제거한다. deltaCount 이후에 유입된 델타는 pending에 보존된다.
     * committed는 {@value MAX_COMMITTED_SIZE}개를 초과하면 오래된 것부터 제거된다.
     * committed 키의 TTL은 {@link #KEY_TTL}으로 갱신된다.
     *
     * @param deltaCount getPending()으로 읽은 항목 수 (그 이후 유입 델타 보존을 위해 필요)
     * @return 이동된 델타 수
     */
    public long commit(Long qnAId, long deltaCount) {
        if (deltaCount <= 0) {
            log.debug("commit 대상 델타 없음: qnAId={}, deltaCount={}", qnAId, deltaCount);
            return 0L;
        }

        Long moved = redisTemplate.execute(
                COMMIT_REDIS_SCRIPT,
                List.of(pendingKey(qnAId), committedKey(qnAId)),
                String.valueOf(MAX_COMMITTED_SIZE), String.valueOf(KEY_TTL_SECONDS), String.valueOf(deltaCount)
        );
        long count = moved != null ? moved : 0L;
        log.debug("commit 완료: qnAId={}, 이동된 델타 수={}", qnAId, count);
        return count;
    }

    /**
     * pending 키만 삭제한다.
     * DB 커밋 후 committed 이동(commit())이 실패했을 때 dirty 데이터를 제거하는 Fallback으로 사용된다.
     * committed 히스토리는 보존되지 않는다.
     */
    public void clearPending(Long qnAId) {
        redisTemplate.delete(pendingKey(qnAId));
        log.warn("pending 키 강제 삭제 (committed 히스토리 미보존): qnAId={}", qnAId);
    }

    /**
     * 세 Redis 키(pending, committed, version)를 모두 삭제한다.
     * 공유 링크 비활성화 등 세션 종료 시 명시적으로 호출해 메모리를 회수한다.
     */
    public void cleanupKeys(Long qnAId) {
        redisTemplate.delete(List.of(pendingKey(qnAId), committedKey(qnAId), versionKey(qnAId)));
        log.debug("Redis 델타 키 삭제 완료: qnAId={}", qnAId);
    }


    private List<TextUpdateRequest> deserializeList(Long qnAId, List<Object> rawList) {
        if (rawList == null || rawList.isEmpty()) {
            return Collections.emptyList();
        }
        return rawList.stream()
                .map(raw -> {
                    try {
                        return objectMapper.readValue((String) raw, TextUpdateRequest.class);
                    } catch (JsonProcessingException e) {
                        log.error("TextUpdateRequest 역직렬화 실패: qnAId={}, raw={}", qnAId, raw, e);
                        throw new BaseException(GlobalErrorCode.INTERNAL_SERVER_ERROR);
                    }
                })
                .toList();
    }
}