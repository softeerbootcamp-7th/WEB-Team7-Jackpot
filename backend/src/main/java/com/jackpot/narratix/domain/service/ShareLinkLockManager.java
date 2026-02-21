package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.ReturnType;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShareLinkLockManager {

    private final StringRedisTemplate redisTemplate;
    private final ShareLinkSessionRegistry sessionRegistry;

    private static final long LOCK_TIMEOUT = 10L; // 10초
    private static final String LOCK_FORMAT = "share-link:lock:%s:%s";

    // 내 락인 경우에만 삭제
    private static final String UNLOCK_SCRIPT
            = """
            if redis.call('get', KEYS[1]) == ARGV[1] then
                return redis.call('del', KEYS[1])
            else
                return 0
            end
            """;
    private static final DefaultRedisScript<Long> UNLOCK_REDIS_SCRIPT =
            new DefaultRedisScript<>(UNLOCK_SCRIPT, Long.class);

    // 내 락인 경우에만 TTL 갱신
    private static final byte[] RENEW_SCRIPT_BYTES
            = """
            if redis.call('get', KEYS[1]) == ARGV[1] then
                return redis.call('expire', KEYS[1], ARGV[2])
            else
                return 0
            end
            """.getBytes(StandardCharsets.UTF_8);

    private static final byte[] LOCK_TIMEOUT_BYTES = String.valueOf(LOCK_TIMEOUT).getBytes(StandardCharsets.UTF_8);

    private static final int NUM_KEYS = 1;

    public boolean tryLock(String sessionId, String shareId, ReviewRoleType role, String userId) {
        String lockKey = getLockKey(shareId, role);

        Boolean success = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, sessionId, Duration.ofSeconds(LOCK_TIMEOUT));

        if (Boolean.TRUE.equals(success)) {
            sessionRegistry.register(sessionId, lockKey, userId);
            log.info("Lock acquired: sessionId={}, shareId={}, role={}, userId={}", sessionId, shareId, role, userId);
        }

        return Boolean.TRUE.equals(success);
    }

    /**
     * sessionId로 락 해제 및 세션 목록에서 제거
     * 락 값이 sessionId이므로 GET 없이 Lua Script 단일 호출로 원자적 해제
     */
    public void unlock(String sessionId) {
        ShareLinkSessionRegistry.SessionEntry entry = sessionRegistry.unregister(sessionId);
        if (entry == null) {
            log.warn("No lock found for session: sessionId={}", sessionId);
            return;
        }

        redisTemplate.execute(UNLOCK_REDIS_SCRIPT, List.of(entry.lockKey()), sessionId);
        log.info("Lock released: sessionId={}, lockKey={}", sessionId, entry.lockKey());
    }

    /**
     * 모든 활성 세션의 분산락 TTL 갱신 (4초마다 호출)
     * Pipeline + Lua Script로 단일 네트워크 IO에 소유권 검증 후 TTL 갱신
     */
    public void renewAllLocks() {
        if (sessionRegistry.isEmpty()) return;

        // 순서 보존을 위해 엔트리 스냅샷 생성
        List<Map.Entry<String, ShareLinkSessionRegistry.SessionEntry>> entries = sessionRegistry.getAllEntries();

        List<Object> results = redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            for (Map.Entry<String, ShareLinkSessionRegistry.SessionEntry> entry : entries) {
                connection.scriptingCommands().eval(
                        RENEW_SCRIPT_BYTES,
                        ReturnType.INTEGER,
                        NUM_KEYS, // Lua EVAL 명령에서 KEYS 배열의 크기, numKeys 이후 인자 중 앞 numKeys 개는 KEYS, 나머지는 ARGV로 분류
                        entry.getValue().lockKey().getBytes(StandardCharsets.UTF_8), // KEYS[1] = lockKey
                        entry.getKey().getBytes(StandardCharsets.UTF_8),              // ARGV[1] = sessionId
                        LOCK_TIMEOUT_BYTES                                             // ARGV[2] = timeout
                );
            }
            return null;
        });

        // 갱신 실패한 세션의 인메모리 상태 정리
        for (int i = 0; i < entries.size(); i++) {
            Long result = (Long) results.get(i);
            if (result == null || result == 0L) {
                Map.Entry<String, ShareLinkSessionRegistry.SessionEntry> entry = entries.get(i);
                sessionRegistry.cleanUp(entry.getKey(), entry.getValue());
                log.warn("Lock renewal failed, cleaned up: sessionId={}, lockKey={}", entry.getKey(), entry.getValue().lockKey());
            }
        }
        log.debug("Lock TTLs renewed for {} sessions via pipeline", entries.size());
    }

    static String getLockKey(String shareId, ReviewRoleType role) {
        return LOCK_FORMAT.formatted(shareId, role);
    }
}