package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.TextDeltaRedisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

/**
 * Redis 델타 저장소를 관리하는 서비스.
 * 델타 저장, 조회, 버전 관리를 담당한다.
 * DB 동기화는 {@link TextSyncService}에서 처리한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TextDeltaService {

    private static final int FLUSH_THRESHOLD = 20;

    private final TextDeltaRedisRepository textDeltaRedisRepository;
    private final QnARepository qnARepository;
    private final TextSyncService textSyncService;

    /**
     * 버전 카운터를 초기화하고 pending 키 TTL을 설정한다.
     * {@code ShareLinkService.getQnAWithVersion()} 에서 세션 시작 시 1회 호출된다.
     *
     * <p>pending 키가 이미 존재하면 TTL이 갱신되고,
     * 존재하지 않으면 EXPIRE는 no-op이다. 세션 중 flush로 pending 키가 삭제된 후
     * 생성되는 새 pending 키의 TTL은 disconnect/deactivation flush로 데이터 유실을 방지한다.</p>
     */
    public void initDeltaVersion(Long qnAId, Long dbVersion) {
        textDeltaRedisRepository.initVersionIfAbsent(qnAId, dbVersion);
        textDeltaRedisRepository.refreshPendingTtl(qnAId);
    }

    /**
     * 해당 QnA의 Redis 델타 키(pending, committed, version)를 모두 삭제한다.
     * 공유 링크 비활성화 시 호출해 메모리를 회수한다.
     */
    public void cleanupDeltaKeys(Long qnAId) {
        textDeltaRedisRepository.cleanupKeys(qnAId);
        log.info("Redis 델타 키 정리 완료: qnAId={}", qnAId);
    }

    /**
     * 델타를 Redis pending에 저장하고, 이 델타의 절대 버전 번호를 반환한다.
     * DB 조회 없이 Redis INCR만으로 버전을 획득한다.
     * 버전 카운터가 없는 경우(Redis 재시작 등)에만 예외적으로 DB를 1회 조회해 재초기화한다.
     *
     * @return 이 델타의 절대 버전 번호 (Reviewer에게 전달)
     */
    public long saveAndMaybeFlush(Long qnAId, TextUpdateRequest request) {
        if (!textDeltaRedisRepository.versionExists(qnAId)) {
            recoverVersionFromDb(qnAId);
        }

        textDeltaRedisRepository.pushAndIncrVersion(qnAId, request);
        long pendingSize = textDeltaRedisRepository.pendingSize(qnAId);
        log.debug("델타 저장: qnAId={}, deltaVersion={}, pendingSize={}", qnAId, request.version(), pendingSize);

        if (pendingSize >= FLUSH_THRESHOLD) {
            log.info("flush 임계값 도달: qnAId={}", qnAId);
            List<TextUpdateRequest> deltas = textSyncService.getPendingDeltas(qnAId);
            textSyncService.flushDeltasToDb(qnAId, deltas, deltas.size());
        }

        return request.version();
    }

    protected void recoverVersionFromDb(Long qnAId) {
        log.warn("버전 카운터 유실 감지, DB에서 재초기화: qnAId={}", qnAId);
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        textDeltaRedisRepository.initVersionIfAbsent(qnAId, qnA.getVersion());
    }

    /**
     * 리뷰 처리(생성·삭제·승인) 후 Redis 버전 카운터를 DB version에 맞게 즉시 갱신한다.
     * TEXT_REPLACE_ALL 이벤트 발행 전에 Redis 버전을 동기화하여 버전 충돌을 방지한다.
     */
    public void resetDeltaVersion(Long qnAId, long newVersion) {
        try {
            textDeltaRedisRepository.setVersion(qnAId, newVersion);
            log.info("리뷰 처리 후 버전 카운터 갱신 완료: qnAId={}, newVersion={}", qnAId, newVersion);
        } catch (Exception e) {
            log.error("리뷰 처리 후 버전 카운터 갱신 실패: qnAId={}, newVersion={}", qnAId, newVersion, e);
        }
    }

    /**
     * OT 변환에 필요한 델타를 committed + pending에서 수집한다.
     * fromVersion 이상의 델타를 version 오름차순으로 반환한다.
     */
    public List<TextUpdateRequest> getOtDeltasSince(Long qnAId, long fromVersion) {
        List<TextUpdateRequest> committed = textDeltaRedisRepository.getCommitted(qnAId);
        List<TextUpdateRequest> pending = textDeltaRedisRepository.getPending(qnAId);
        return Stream.concat(committed.stream(), pending.stream()) // version asc
                .filter(d -> d.version() >= fromVersion)
                .toList();
    }
}