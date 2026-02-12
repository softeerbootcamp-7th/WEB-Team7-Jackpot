package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ShareLinkLockManager {

    private final StringRedisTemplate redisTemplate;

    private static final long LOCK_TIMEOUT = 60L * 60L;
    private static final String LOCK_FORMAT = "share-link:lock:%s:%s";
    private static final String UNLOCK_SCRIPT
            = """
            if redis.call('get', KEYS[1]) == ARGV[1] then
                return redis.call('del', KEYS[1])
            else
                return 0
            end
            """;
    private static final DefaultRedisScript<Long> UNLOCK_REDIS_SCRIPT;

    static {
        UNLOCK_REDIS_SCRIPT = new DefaultRedisScript<>(UNLOCK_SCRIPT, Long.class);
    }


    public boolean tryLock(String shareId, ReviewRoleType role, String userId) {
        String lockKey = getLockKey(shareId, role);

        Boolean success = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, userId, Duration.ofSeconds(LOCK_TIMEOUT));

        return Boolean.TRUE.equals(success);
    }

    public void unlock(String shareId, ReviewRoleType role, String userId) {
        String lockKey = getLockKey(shareId, role);

        redisTemplate.execute(
                UNLOCK_REDIS_SCRIPT,
                List.of(lockKey),
                userId
        );
    }

    private String getLockKey(String shareId, ReviewRoleType role) {
        return LOCK_FORMAT.formatted(shareId, role);
    }
}
