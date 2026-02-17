package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.ShareLink;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.repository.ShareLinkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import static com.jackpot.narratix.domain.service.ShareLinkLockManager.getLockKey;

/**
 * WebSocket 세션과 ShareLink 간의 연결 상태를 추적하는 레지스트리.
 * ShareLinkLockManager에서 락 획득/해제 시 호출되며,
 * 현재 웹소켓에 연결된 유저를 조회할 때 사용된다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ShareLinkSessionRegistry {

    private final ShareLinkRepository shareLinkRepository;

    // key: sessionId, value: SessionEntry(lockKey, userId)
    private final Map<String, SessionEntry> sessionEntries = new ConcurrentHashMap<>();

    // key: lockKey, value: sessionId (소유권 검증용)
    private final Map<String, String> lockOwners = new ConcurrentHashMap<>();

    public record SessionEntry(String lockKey, String userId) {}

    public void register(String sessionId, String lockKey, String userId) {
        sessionEntries.put(sessionId, new SessionEntry(lockKey, userId));
        lockOwners.put(lockKey, sessionId);
    }

    public SessionEntry unregister(String sessionId) {
        SessionEntry entry = sessionEntries.remove(sessionId);
        if (entry != null) {
            lockOwners.remove(entry.lockKey(), sessionId);
        }
        return entry;
    }

    private Optional<String> findConnectedUserId(String shareId, ReviewRoleType role) {
        String lockKey = getLockKey(shareId, role);
        String ownerSessionId = lockOwners.get(lockKey);
        if (ownerSessionId == null) return Optional.empty();
        return Optional.ofNullable(sessionEntries.get(ownerSessionId)).map(SessionEntry::userId);
    }

    @Transactional(readOnly = true)
    public boolean isConnectedUserInCoverLetter(String userId, Long coverLetterId, ReviewRoleType role) {
        return findShareId(coverLetterId)
                .flatMap(shareId -> findConnectedUserId(shareId, role))
                .map(userId::equals)
                .orElse(false);
    }

    private Optional<String> findShareId(Long coverLetterId) {
        return shareLinkRepository.findByCoverLetterId(coverLetterId)
                .filter(ShareLink::isValid)
                .map(ShareLink::getShareId);
    }

    public List<Map.Entry<String, SessionEntry>> getAllEntries() {
        return List.copyOf(sessionEntries.entrySet());
    }

    public boolean isEmpty() {
        return sessionEntries.isEmpty();
    }

    public void cleanUp(String sessionId, SessionEntry entry) {
        sessionEntries.remove(sessionId, entry);
        lockOwners.remove(entry.lockKey(), sessionId);
    }
}