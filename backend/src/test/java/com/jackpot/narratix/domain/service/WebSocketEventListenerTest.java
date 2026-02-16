package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;
import com.jackpot.narratix.domain.entity.ShareLink;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.event.ReviewCreatedEvent;
import com.jackpot.narratix.domain.event.ReviewEditEvent;
import com.jackpot.narratix.domain.event.WebSocketEventListener;
import com.jackpot.narratix.domain.fixture.UserFixture;
import com.jackpot.narratix.domain.repository.UserRepository;
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

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebSocketEventListenerTest {

    @InjectMocks
    private WebSocketEventListener webSocketEventListener;

    @Mock
    private WebSocketMessageSender webSocketMessageSender;

    @Mock
    private ShareLinkLockManager shareLinkLockManager;

    @Mock
    private ShareLinkService shareLinkService;

    @Mock
    private UserRepository userRepository;

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

    @Test
    @DisplayName("리뷰 생성 이벤트 발생 시 활성화된 ShareLink가 있으면 WebSocket 메시지를 전송한다")
    void handleReviewCreatedEvent_ActiveShareLink_SendsWebSocketMessage() {
        // given
        String reviewerId = "reviewer123";
        Long coverLetterId = 1L;
        Long reviewId = 10L;
        Long qnAId = 2L;

        User reviewer = UserFixture.builder()
                .id(reviewerId)
                .nickname("리뷰어닉네임")
                .build();

        ShareLink shareLink = ShareLink.newActivatedShareLink(coverLetterId);

        ReviewCreatedEvent event = new ReviewCreatedEvent(
                coverLetterId,
                qnAId,
                reviewerId,
                reviewId,
                "원본 텍스트",
                "수정 제안",
                "코멘트",
                LocalDateTime.now()
        );

        given(userRepository.findByIdOrElseThrow(reviewerId)).willReturn(reviewer);
        given(shareLinkService.getActiveShareLinkByCoverLetterId(coverLetterId)).willReturn(Optional.of(shareLink));

        // when
        webSocketEventListener.handleReviewCreatedEvent(event);

        // then
        verify(userRepository).findByIdOrElseThrow(reviewerId);
        verify(shareLinkService).getActiveShareLinkByCoverLetterId(coverLetterId);
        verify(webSocketMessageSender).sendMessageToShare(anyString(), any(WebSocketMessageResponse.class));
    }

    @Test
    @DisplayName("리뷰 생성 이벤트 발생 시 활성화된 ShareLink가 없으면 WebSocket 메시지를 전송하지 않는다")
    void handleReviewCreatedEvent_NoActiveShareLink_DoesNotSendMessage() {
        // given
        String reviewerId = "reviewer123";
        Long coverLetterId = 1L;
        Long qnAId = 2L;

        ReviewCreatedEvent event = new ReviewCreatedEvent(
                coverLetterId,
                qnAId,
                reviewerId,
                10L,
                "원본 텍스트",
                "수정 제안",
                "코멘트",
                LocalDateTime.now()
        );

        given(shareLinkService.getActiveShareLinkByCoverLetterId(coverLetterId)).willReturn(Optional.empty());

        // when
        webSocketEventListener.handleReviewCreatedEvent(event);

        // then
        verify(shareLinkService).getActiveShareLinkByCoverLetterId(coverLetterId);
        verify(webSocketMessageSender, never()).sendMessageToShare(anyString(), any());
    }

    @Test
    @DisplayName("리뷰 수정 이벤트 발생 시 활성화된 ShareLink가 있으면 WebSocket 메시지를 전송한다")
    void handleReviewEditEvent_ActiveShareLink_SendsWebSocketMessage() {
        // given
        String reviewerId = "reviewer123";
        Long coverLetterId = 1L;
        Long reviewId = 10L;
        Long qnAId = 2L;

        ShareLink shareLink = ShareLink.newActivatedShareLink(coverLetterId);

        ReviewEditEvent event = new com.jackpot.narratix.domain.event.ReviewEditEvent(
                coverLetterId,
                qnAId,
                reviewId,
                reviewerId,
                "원본 텍스트",
                "수정된 제안",
                "수정된 코멘트",
                LocalDateTime.now()
        );

        given(shareLinkService.getActiveShareLinkByCoverLetterId(coverLetterId)).willReturn(Optional.of(shareLink));

        // when
        webSocketEventListener.handleReviewEditEvent(event);

        // then
        verify(shareLinkService).getActiveShareLinkByCoverLetterId(coverLetterId);
        verify(webSocketMessageSender).sendMessageToShare(anyString(), any(WebSocketMessageResponse.class));
    }

    @Test
    @DisplayName("리뷰 수정 이벤트 발생 시 활성화된 ShareLink가 없으면 WebSocket 메시지를 전송하지 않는다")
    void handleReviewEditEvent_NoActiveShareLink_DoesNotSendMessage() {
        // given
        Long coverLetterId = 1L;

        com.jackpot.narratix.domain.event.ReviewEditEvent event = new com.jackpot.narratix.domain.event.ReviewEditEvent(
                coverLetterId,
                2L,
                10L,
                "reviewer123",
                "원본 텍스트",
                "수정된 제안",
                "수정된 코멘트",
                LocalDateTime.now()
        );

        given(shareLinkService.getActiveShareLinkByCoverLetterId(coverLetterId)).willReturn(Optional.empty());

        // when
        webSocketEventListener.handleReviewEditEvent(event);

        // then
        verify(shareLinkService).getActiveShareLinkByCoverLetterId(coverLetterId);
        verify(webSocketMessageSender, never()).sendMessageToShare(anyString(), any());
    }

    @Test
    @DisplayName("리뷰 삭제 이벤트 발생 시 활성화된 ShareLink가 있으면 WebSocket 메시지를 전송한다")
    void handleReviewDeleteEvent_ActiveShareLink_SendsWebSocketMessage() {
        // given
        Long coverLetterId = 1L;
        Long qnAId = 1L;
        Long reviewId = 10L;

        ShareLink shareLink = ShareLink.newActivatedShareLink(coverLetterId);

        com.jackpot.narratix.domain.event.ReviewDeleteEvent event = new com.jackpot.narratix.domain.event.ReviewDeleteEvent(
                coverLetterId,
                qnAId,
                reviewId
        );

        given(shareLinkService.getActiveShareLinkByCoverLetterId(coverLetterId)).willReturn(Optional.of(shareLink));

        // when
        webSocketEventListener.handleReviewDeleteEvent(event);

        // then
        verify(shareLinkService).getActiveShareLinkByCoverLetterId(coverLetterId);
        verify(webSocketMessageSender).sendMessageToShare(anyString(), any(WebSocketMessageResponse.class));
    }

    @Test
    @DisplayName("리뷰 삭제 이벤트 발생 시 활성화된 ShareLink가 없으면 WebSocket 메시지를 전송하지 않는다")
    void handleReviewDeleteEvent_NoActiveShareLink_DoesNotSendMessage() {
        // given
        Long coverLetterId = 1L;

        com.jackpot.narratix.domain.event.ReviewDeleteEvent event = new com.jackpot.narratix.domain.event.ReviewDeleteEvent(
                coverLetterId,
                2L,
                10L
        );

        given(shareLinkService.getActiveShareLinkByCoverLetterId(coverLetterId)).willReturn(Optional.empty());

        // when
        webSocketEventListener.handleReviewDeleteEvent(event);

        // then
        verify(shareLinkService).getActiveShareLinkByCoverLetterId(coverLetterId);
        verify(webSocketMessageSender, never()).sendMessageToShare(anyString(), any());
    }
}