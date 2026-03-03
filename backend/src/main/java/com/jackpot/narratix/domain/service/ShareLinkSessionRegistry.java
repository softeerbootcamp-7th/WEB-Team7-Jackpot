package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.service.dto.SessionEntry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket 세션과 ShareLink 간의 연결 상태를 추적하는 레지스트리.
 * ShareLinkLockManager에서 락 획득/해제 시 호출되며,
 * 현재 웹소켓에 연결된 유저를 조회할 때 사용된다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ShareLinkSessionRegistry {

    // key: sessionId, value: SessionEntry(lockKey, userId, lastActiveTime)
    private final Map<String, SessionEntry> sessionEntries = new ConcurrentHashMap<>();

    public SessionEntry getSessionEntry(String sessionId) {
        return sessionEntries.get(sessionId);
    }

    public void register(String sessionId, String lockKey, String userId) {
        sessionEntries.put(sessionId, new SessionEntry(lockKey, userId));
    }

    public SessionEntry unregister(String sessionId) {
        return sessionEntries.remove(sessionId);
    }

    public boolean isEmpty() {
        return sessionEntries.isEmpty();
    }

    public List<Map.Entry<String, SessionEntry>> getAllEntries() {
        return List.copyOf(sessionEntries.entrySet());
    }

    public void updateActivity(String sessionId) {
        SessionEntry info = sessionEntries.get(sessionId);
        if (info != null) {
            info.updateActiveTime();
        }
    }

    public void cleanUp(String sessionId, SessionEntry sessionEntry) {
        if (sessionEntry != null) {
            sessionEntries.remove(sessionId, sessionEntry);
        }
    }
}