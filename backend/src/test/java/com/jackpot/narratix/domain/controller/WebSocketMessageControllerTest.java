package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.WebSocketErrorCode;
import com.jackpot.narratix.domain.service.TextDeltaService;
import com.jackpot.narratix.domain.service.WebSocketMessageSender;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.websocket.WebSocketSessionAttributes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebSocketMessageControllerTest {

    @InjectMocks
    private WebSocketMessageController webSocketMessageController;

    @Mock
    private WebSocketMessageSender webSocketMessageSender;

    @Mock
    private TextDeltaService textDeltaService;

    private SimpMessageHeaderAccessor headerAccessor;
    private Map<String, Object> sessionAttributes;

    @BeforeEach
    void setUp() {
        headerAccessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        sessionAttributes = new HashMap<>();
        headerAccessor.setSessionAttributes(sessionAttributes);
    }

    @Test
    @DisplayName("Writer가 정상적으로 구독한다")
    void subscribeWriterCoverLetter_Success() {
        // given
        String shareId = "test-share-123";
        String userId = "user123";
        Long qnAId = 2L;
        ReviewRoleType role = ReviewRoleType.WRITER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        // when
        webSocketMessageController.subscribeWriterCoverLetter(shareId, qnAId, headerAccessor);

        // then - 예외가 발생하지 않으면 성공
        verifyNoInteractions(webSocketMessageSender);
    }

    @Test
    @DisplayName("Writer 구독 시 shareId가 일치하지 않으면 예외가 발생한다")
    void subscribeWriterCoverLetter_ShareIdMismatch_ThrowsException() {
        // given
        String pathShareId = "path-share-123";
        String sessionShareId = "session-share-456";
        String userId = "user123";
        Long qnAId = 2L;
        ReviewRoleType role = ReviewRoleType.WRITER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, sessionShareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        // when & then
        assertThatThrownBy(() ->
                webSocketMessageController.subscribeWriterCoverLetter(pathShareId, qnAId, headerAccessor)
        ).isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.SHARE_ID_MISMATCH);
    }

    @Test
    @DisplayName("Writer 구독 시 role이 REVIEWER이면 예외가 발생한다")
    void subscribeWriterCoverLetter_RoleMismatch_ThrowsException() {
        // given
        String shareId = "test-share-123";
        String userId = "user123";
        Long qnAId = 2L;
        ReviewRoleType role = ReviewRoleType.REVIEWER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        // when & then
        assertThatThrownBy(() ->
                webSocketMessageController.subscribeWriterCoverLetter(shareId, qnAId, headerAccessor)
        ).isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.ROLE_MISMATCH);
    }

    @Test
    @DisplayName("Reviewer가 정상적으로 구독한다")
    void subscribeReviewerCoverLetter_Success() {
        // given
        String shareId = "test-share-123";
        String userId = "user456";
        Long qnAId = 2L;
        ReviewRoleType role = ReviewRoleType.REVIEWER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        // when
        webSocketMessageController.subscribeReviewerCoverLetter(shareId, qnAId, headerAccessor);

        // then - 예외가 발생하지 않으면 성공
        verifyNoInteractions(webSocketMessageSender);
    }

    @Test
    @DisplayName("Reviewer 구독 시 shareId가 일치하지 않으면 예외가 발생한다")
    void subscribeReviewerCoverLetter_ShareIdMismatch_ThrowsException() {
        // given
        String pathShareId = "path-share-123";
        String sessionShareId = "session-share-456";
        String userId = "user456";
        Long qnAId = 2L;
        ReviewRoleType role = ReviewRoleType.REVIEWER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, sessionShareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        // when & then
        assertThatThrownBy(() ->
                webSocketMessageController.subscribeReviewerCoverLetter(pathShareId, qnAId, headerAccessor)
        ).isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.SHARE_ID_MISMATCH);
    }

    @Test
    @DisplayName("Reviewer 구독 시 role이 WRITER이면 예외가 발생한다")
    void subscribeReviewerCoverLetter_RoleMismatch_ThrowsException() {
        // given
        String shareId = "test-share-123";
        String userId = "user456";
        Long qnAId = 2L;
        ReviewRoleType role = ReviewRoleType.WRITER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        // when & then
        assertThatThrownBy(() ->
                webSocketMessageController.subscribeReviewerCoverLetter(shareId, qnAId, headerAccessor)
        ).isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.ROLE_MISMATCH);
    }

    @Test
    @DisplayName("Writer가 텍스트 업데이트를 정상적으로 전송한다")
    void updateText_Success() {
        // given
        String shareId = "test-share-123";
        Long qnAId = 1L;
        String userId = "user123";
        ReviewRoleType role = ReviewRoleType.WRITER;
        Long version = 2L;

        given(textDeltaService.saveAndMaybeFlush(eq(qnAId), any(TextUpdateRequest.class))).willReturn(version);

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        TextUpdateRequest request = new TextUpdateRequest(
                version,
                0,       // startIdx
                10,      // endIdx
                "Updated text"
        );

        // when
        webSocketMessageController.updateText(shareId, qnAId, request, headerAccessor);

        // then
        verify(webSocketMessageSender).sendMessageToReviewer(eq(shareId), any(WebSocketMessageResponse.class));
    }

    @Test
    @DisplayName("텍스트 업데이트 시 세션 속성이 null이면 예외가 발생한다")
    void updateText_NullSessionAttributes_ThrowsException() {
        // given
        headerAccessor.setSessionAttributes(null);
        String shareId = "test-share-123";
        Long qnAId = 1L;
        TextUpdateRequest request = new TextUpdateRequest(1L, 0, 10, "text");

        // when & then
        assertThatThrownBy(() ->
                webSocketMessageController.updateText(shareId, qnAId, request, headerAccessor)
        ).isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.INVALID_SESSION);

        verifyNoInteractions(webSocketMessageSender);
    }

    @Test
    @DisplayName("텍스트 업데이트 시 shareId가 일치하지 않으면 예외가 발생한다")
    void updateText_ShareIdMismatch_ThrowsException() {
        // given
        String pathShareId = "path-share-123";
        String sessionShareId = "session-share-456";
        Long qnAId = 1L;
        String userId = "user123";
        ReviewRoleType role = ReviewRoleType.WRITER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, sessionShareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        TextUpdateRequest request = new TextUpdateRequest(1L, 0, 10, "text");

        // when & then
        assertThatThrownBy(() ->
                webSocketMessageController.updateText(pathShareId, qnAId, request, headerAccessor)
        ).isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.SHARE_ID_MISMATCH);

        verifyNoInteractions(webSocketMessageSender);
    }

    @Test
    @DisplayName("텍스트 업데이트 시 REVIEWER는 권한이 없어 예외가 발생한다")
    void updateText_ReviewerUnauthorized_ThrowsException() {
        // given
        String shareId = "test-share-123";
        Long qnAId = 1L;
        String userId = "user456";
        ReviewRoleType role = ReviewRoleType.REVIEWER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        TextUpdateRequest request = new TextUpdateRequest(1L, 0, 10, "text");

        // when & then
        assertThatThrownBy(() ->
                webSocketMessageController.updateText(shareId, qnAId, request, headerAccessor)
        ).isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.UNAUTHORIZED_TEXT_UPDATE);

        verifyNoInteractions(webSocketMessageSender);
    }

    @Test
    @DisplayName("구독 시 세션 속성이 null이면 예외가 발생한다")
    void subscribeWriterCoverLetter_NullSessionAttributes_ThrowsException() {
        // given
        headerAccessor.setSessionAttributes(null);
        String shareId = "test-share-123";
        Long qnAId = 2L;

        // when & then
        assertThatThrownBy(() ->
                webSocketMessageController.subscribeWriterCoverLetter(shareId, qnAId, headerAccessor)
        ).isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.INVALID_SESSION);
    }
}