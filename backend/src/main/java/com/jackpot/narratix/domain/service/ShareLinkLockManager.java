package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShareLinkLockManager {

    private final StringRedisTemplate redisTemplate;

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

    // key: sessionId, value: lockKey
    private final Map<String, String> sessionLocks = new ConcurrentHashMap<>();

    public boolean tryLock(String sessionId, String shareId, ReviewRoleType role, String userId) {
        String lockKey = getLockKey(shareId, role);

        Boolean success = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, userId, Duration.ofSeconds(LOCK_TIMEOUT));

        if (Boolean.TRUE.equals(success)) {
            sessionLocks.put(sessionId, lockKey);
            log.info("Lock acquired: sessionId={}, shareId={}, role={}, userId={}", sessionId, shareId, role, userId);
        }

        return Boolean.TRUE.equals(success);
    }

    /**
     * sessionId로 락 해제 및 세션 목록에서 제거
     */
    public void unlock(String sessionId) {
        String lockKey = sessionLocks.remove(sessionId);
        if (lockKey == null) {
            log.warn("No lock found for session: sessionId={}", sessionId);
            return;
        }

        // Redis에서 현재 소유자(userId) 조회 후 Lua Script로 안전하게 삭제
        String userId = redisTemplate.opsForValue().get(lockKey);
        if (userId == null) {
            log.warn("Lock already expired: sessionId={}, lockKey={}", sessionId, lockKey);
            return;
        }

        redisTemplate.execute(UNLOCK_REDIS_SCRIPT, List.of(lockKey), userId);
        log.info("Lock released: sessionId={}, lockKey={}", sessionId, lockKey);
    }

    /**
     * 모든 활성 세션의 분산락 TTL 갱신 (4초마다 호출)
     * Pipeline을 이용해 단일 네트워크 IO로 모든 락 갱신 명령 전송
     */
    public void renewAllLocks() {
        Collection<String> lockKeys = sessionLocks.values();
        if (lockKeys.isEmpty()) return;

        redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            for (String lockKey : lockKeys) {
                connection.keyCommands().expire(lockKey.getBytes(StandardCharsets.UTF_8), LOCK_TIMEOUT);
            }
            return null;
        });
        log.debug("Lock TTLs renewed for {} sessions via pipeline", lockKeys.size());
    }

    private String getLockKey(String shareId, ReviewRoleType role) {
        return LOCK_FORMAT.formatted(shareId, role);
    }
}
