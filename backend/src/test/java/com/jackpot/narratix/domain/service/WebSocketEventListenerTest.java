package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.event.WebSocketEventListener;
import com.jackpot.narratix.global.websocket.WebSocketSessionAttributes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebSocketEventListenerTest {

    @InjectMocks
    private WebSocketEventListener webSocketEventListener;

    @Mock
    private ShareLinkLockManager shareLinkLockManager;

    private StompHeaderAccessor accessor;
    private Map<String, Object> sessionAttributes;

    @BeforeEach
    void setUp() {
        accessor = StompHeaderAccessor.create(StompCommand.DISCONNECT);
        sessionAttributes = new HashMap<>();
        accessor.setSessionAttributes(sessionAttributes);
    }

    @Test
    @DisplayName("정상적인 연결 종료 시 락을 해제한다")
    void handleWebSocketDisconnectListener_ValidSession_UnlocksShareLink() {
        // given
        String userId = "user123";
        String shareId = "share456";
        ReviewRoleType role = ReviewRoleType.WRITER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        SessionDisconnectEvent event = new SessionDisconnectEvent(
                this,
                MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders()),
                "test-session-id",
                null
        );

        // when
        webSocketEventListener.handleWebSocketDisconnectListener(event);

        // then
        verify(shareLinkLockManager).unlock(shareId, role, userId);
    }

    @Test
    @DisplayName("REVIEWER 역할의 연결 종료 시에도 락을 해제한다")
    void handleWebSocketDisconnectListener_ReviewerRole_UnlocksShareLink() {
        // given
        String userId = "reviewer123";
        String shareId = "share456";
        ReviewRoleType role = ReviewRoleType.REVIEWER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        SessionDisconnectEvent event = new SessionDisconnectEvent(
                this,
                MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders()),
                "test-session-id",
                null
        );

        // when
        webSocketEventListener.handleWebSocketDisconnectListener(event);

        // then
        verify(shareLinkLockManager).unlock(shareId, role, userId);
    }
}