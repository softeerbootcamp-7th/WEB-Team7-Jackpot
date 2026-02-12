package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.global.websocket.WebSocketSessionAttributes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final ShareLinkLockManager shareLinkLockManager;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> attributes = headerAccessor.getSessionAttributes();

        // 세션 속성 검증
        if (!WebSocketSessionAttributes.isValid(attributes)) {
            log.warn("Invalid session attributes during disconnect");
            return;
        }

        // 세션 속성 추출
        String userId = WebSocketSessionAttributes.getUserId(attributes);
        String shareId = WebSocketSessionAttributes.getShareId(attributes);
        ReviewRoleType role = WebSocketSessionAttributes.getRole(attributes);

        log.info("웹소켓 연결 종료. UserId: {}, ShareId: {}, Role: {}", userId, shareId, role);

        // 락 해제
        try {
            shareLinkLockManager.unlock(shareId, role, userId);
        } catch (Exception e) {
            log.error("Failed to release lock on disconnect: shareId={}, role={}, userId={}", shareId, role, userId, e);
        }

    }
}
