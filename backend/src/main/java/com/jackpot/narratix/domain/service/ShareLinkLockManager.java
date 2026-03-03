package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.service.dto.SessionEntry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.ReturnType;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShareLinkLockManager {

    private final StringRedisTemplate redisTemplate;
    private final ShareLinkSessionRegistry sessionRegistry;

    private static final long LOCK_TIMEOUT = 30L; // 30초
    private static final long ZOMBIE_THRESHOLD = 20_000L; // 20초간 응답 없으면 좀비로 간주
    private static final String LOCK_FORMAT = "share-link:lock:%s:%s"; // 첨삭 링크 인원 제한을 위함
    private static final String SESSION_KEY_FORMAT = "share-link:session:%s"; // 세션 아이디로 어떤 유저가 웹소켓에 연결되어 있는지 확인하기 위함

    private static final String TRY_LOCK_SCRIPT = """
            if redis.call('set', KEYS[1], ARGV[1], 'NX', 'EX', ARGV[3]) then
                redis.call('set', KEYS[2], ARGV[2], 'EX', ARGV[3])
                return 1
            else
                return 0
            end
            """;
    private static final DefaultRedisScript<Long> TRY_LOCK_REDIS_SCRIPT =
            new DefaultRedisScript<>(TRY_LOCK_SCRIPT, Long.class);

    // 내 락인 경우에만 삭제
    private static final String UNLOCK_SCRIPT = """
            if redis.call('get', KEYS[1]) == ARGV[1] then
                redis.call('del', KEYS[1])
                redis.call('del', KEYS[2])
                return 1
            else
                return 0
            end
            """;
    private static final DefaultRedisScript<Long> UNLOCK_REDIS_SCRIPT = new DefaultRedisScript<>(UNLOCK_SCRIPT, Long.class);

    // 내 락인 경우에만 TTL 갱신
    private static final byte[] RENEW_SCRIPT_BYTES = """
            if redis.call('get', KEYS[1]) == ARGV[1] then
                redis.call('expire', KEYS[1], ARGV[2])
                redis.call('expire', KEYS[2], ARGV[2])
                return 1
            else
                return 0
            end
            """.getBytes(StandardCharsets.UTF_8);
    private static final byte[] LOCK_TIMEOUT_BYTES = String.valueOf(LOCK_TIMEOUT).getBytes(StandardCharsets.UTF_8);

    private static final Long REDIS_TRUE = 1L;
    private static final int NUM_KEYS = 2;

    public boolean tryLock(String sessionId, String shareId, ReviewRoleType role, String userId) {
        String lockKey = getLockKey(shareId, role);
        String sessionKey = getSessionKey(sessionId);

        Long success = redisTemplate.execute(
                TRY_LOCK_REDIS_SCRIPT,
                List.of(lockKey, sessionKey),
                sessionId,
                userId,
                String.valueOf(LOCK_TIMEOUT)
        );
        if (REDIS_TRUE.equals(success)) {
            sessionRegistry.register(sessionId, lockKey, userId);
            return true;
        }
        return false;
    }

    public void unlock(String sessionId) {
        SessionEntry entry = sessionRegistry.getSessionEntry(sessionId);
        if (entry == null) {
            log.warn("No lock found for session: sessionId={}", sessionId);
            return;
        }
        String sessionKey = getSessionKey(sessionId);
        Long unlocked = redisTemplate.execute(UNLOCK_REDIS_SCRIPT, List.of(entry.getLockKey(), sessionKey), sessionId);

        if (REDIS_TRUE.equals(unlocked)) {
            log.info("Lock released: sessionId={}, lockKey={}", sessionId, entry.getLockKey());
        } else {
            log.warn("Unlock skipped: sessionId={}, lockKey={},", sessionId, entry.getLockKey());
        }

        // Redis 락이 먼저 해제되고 인 메모리에서 지워야 좀비 락 방지가 가능함
        sessionRegistry.unregister(sessionId);
    }

    /**
     * 모든 활성 세션의 분산락 TTL 갱신 (10초마다 호출)
     * 1. 좀비 세션(20초 무응답) 사전 필터링 및 제거
     * 2. Pipeline + Lua Script로 단일 네트워크 IO에 소유권 검증 후 TTL 갱신 (Lock & Session 동시 갱신)
     */
    public void renewAllLocks() {
        if (sessionRegistry.isEmpty()) return;

        long now = System.currentTimeMillis();

        // 갱신할 유효 세션만 담을 리스트
        List<Map.Entry<String, SessionEntry>> validEntries = new ArrayList<>();

        // 좀비 세션 필터링
        for (Map.Entry<String, SessionEntry> entry : sessionRegistry.getAllEntries()) {
            String sessionId = entry.getKey();
            SessionEntry sessionEntry = entry.getValue();

            // 클라이언트가 20초 이상 활동이 없었다면 좀비로 간주하고 갱신 대상에서 제외
            if (now - sessionEntry.getLastActiveTime() > ZOMBIE_THRESHOLD) {
                log.warn("Zombie session detected. Stop renewing: sessionId={}, lockKey={}", sessionId, sessionEntry.getLockKey());
                sessionRegistry.cleanUp(sessionId, sessionEntry); // 로컬에서 삭제
                continue;
            }
            validEntries.add(entry);
        }

        if (validEntries.isEmpty()) return;

        // 유효한 세션들만 Pipeline으로 일괄 갱신
        List<Object> results = redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            for (Map.Entry<String, SessionEntry> entry : validEntries) {
                String sessionId = entry.getKey();
                String lockKey = entry.getValue().getLockKey();
                String sessionKey = getSessionKey(sessionId);

                connection.scriptingCommands().eval(
                        RENEW_SCRIPT_BYTES,
                        ReturnType.INTEGER,
                        NUM_KEYS,
                        lockKey.getBytes(StandardCharsets.UTF_8),    // KEYS[1] = lockKey
                        sessionKey.getBytes(StandardCharsets.UTF_8), // KEYS[2] = sessionKey
                        sessionId.getBytes(StandardCharsets.UTF_8),  // ARGV[1] = sessionId
                        LOCK_TIMEOUT_BYTES                           // ARGV[2] = timeout
                );
            }
            return null;
        });

        // Redis 연장 실패(이미 만료/유실된 락) 처리
        for (int i = 0; i < validEntries.size(); i++) {
            Long result = (Long) results.get(i);
            if (!REDIS_TRUE.equals(result)) { // 갱신 실패: 락이 이미 만료되었거나 Redis에서 유실된 경우
                Map.Entry<String, SessionEntry> entry = validEntries.get(i);
                sessionRegistry.cleanUp(entry.getKey(), entry.getValue());
                log.warn("Lock renewal failed (already expired in Redis), cleaned up: sessionId={}, lockKey={}"
                        , entry.getKey(), entry.getValue().getLockKey());
            }
        }

        log.debug("Lock TTLs renewed for {} sessions via pipeline", validEntries.size());
    }

    private String getLockKey(String shareId, ReviewRoleType role) {
        return LOCK_FORMAT.formatted(shareId, role);
    }

    public boolean isConnectedUserInCoverLetter(String userId, String shareId, ReviewRoleType role) {
        String lockKey = getLockKey(shareId, role);
        String ownerSessionId = redisTemplate.opsForValue().get(lockKey);

        if (ownerSessionId == null) return false;

        String connectedUserId = redisTemplate.opsForValue().get(getSessionKey(ownerSessionId));
        return userId.equals(connectedUserId);
    }

    private String getSessionKey(String sessionId) {
        return SESSION_KEY_FORMAT.formatted(sessionId);
    }

    public void updateActivity(String sessionId) {
        sessionRegistry.updateActivity(sessionId);
    }
}