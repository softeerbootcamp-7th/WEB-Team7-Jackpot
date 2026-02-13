package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.WebSocketErrorCode;
import com.jackpot.narratix.domain.service.WebSocketMessageService;
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
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class WebSocketMessageControllerTest {

    @InjectMocks
    private WebSocketMessageController webSocketMessageController;

    @Mock
    private WebSocketMessageService webSocketMessageService;

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
        ReviewRoleType role = ReviewRoleType.WRITER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        doNothing().when(webSocketMessageService).validateShareId(shareId, shareId);
        doNothing().when(webSocketMessageService).validateRole(role, ReviewRoleType.WRITER, shareId, shareId);

        // when
        webSocketMessageController.subscribeWriterCoverLetter(shareId, headerAccessor);

        // then
        verify(webSocketMessageService).validateShareId(shareId, shareId);
        verify(webSocketMessageService).validateRole(role, ReviewRoleType.WRITER, shareId, shareId);
    }

    @Test
    @DisplayName("Writer 구독 시 shareId가 일치하지 않으면 검증 메서드를 호출한다")
    void subscribeWriterCoverLetter_ShareIdMismatch() {
        // given
        String pathShareId = "path-share-123";
        String sessionShareId = "session-share-456";
        String userId = "user123";
        ReviewRoleType role = ReviewRoleType.WRITER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, sessionShareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        doThrow(new BaseException(WebSocketErrorCode.SHARE_ID_MISMATCH))
                .when(webSocketMessageService).validateShareId(pathShareId, sessionShareId);

        // when & then
        assertThatThrownBy(() ->
            webSocketMessageController.subscribeWriterCoverLetter(pathShareId, headerAccessor)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.SHARE_ID_MISMATCH);

        verify(webSocketMessageService).validateShareId(pathShareId, sessionShareId);
    }

    @Test
    @DisplayName("Writer 구독 시 role이 일치하지 않으면 예외가 발생한다")
    void subscribeWriterCoverLetter_RoleMismatch() {
        // given
        String shareId = "test-share-123";
        String userId = "user123";
        ReviewRoleType role = ReviewRoleType.REVIEWER; // WRITER가 아님

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        doNothing().when(webSocketMessageService).validateShareId(shareId, shareId);
        doThrow(new BaseException(WebSocketErrorCode.ROLE_MISMATCH))
                .when(webSocketMessageService).validateRole(role, ReviewRoleType.WRITER, shareId, shareId);

        // when & then
        assertThatThrownBy(() ->
            webSocketMessageController.subscribeWriterCoverLetter(shareId, headerAccessor)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.ROLE_MISMATCH);

        verify(webSocketMessageService).validateRole(role, ReviewRoleType.WRITER, shareId, shareId);
    }

    @Test
    @DisplayName("Reviewer가 정상적으로 구독한다")
    void subscribeReviewerCoverLetter_Success() {
        // given
        String shareId = "test-share-123";
        String userId = "user456";
        ReviewRoleType role = ReviewRoleType.REVIEWER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        doNothing().when(webSocketMessageService).validateShareId(shareId, shareId);
        doNothing().when(webSocketMessageService).validateRole(role, ReviewRoleType.REVIEWER, shareId, shareId);

        // when
        webSocketMessageController.subscribeReviewerCoverLetter(shareId, headerAccessor);

        // then
        verify(webSocketMessageService).validateShareId(shareId, shareId);
        verify(webSocketMessageService).validateRole(role, ReviewRoleType.REVIEWER, shareId, shareId);
    }

    @Test
    @DisplayName("Reviewer 구독 시 shareId가 일치하지 않으면 예외가 발생한다")
    void subscribeReviewerCoverLetter_ShareIdMismatch() {
        // given
        String pathShareId = "path-share-123";
        String sessionShareId = "session-share-456";
        String userId = "user456";
        ReviewRoleType role = ReviewRoleType.REVIEWER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, sessionShareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        doThrow(new BaseException(WebSocketErrorCode.SHARE_ID_MISMATCH))
                .when(webSocketMessageService).validateShareId(pathShareId, sessionShareId);

        // when & then
        assertThatThrownBy(() ->
            webSocketMessageController.subscribeReviewerCoverLetter(pathShareId, headerAccessor)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.SHARE_ID_MISMATCH);
    }

    @Test
    @DisplayName("Reviewer 구독 시 role이 일치하지 않으면 예외가 발생한다")
    void subscribeReviewerCoverLetter_RoleMismatch() {
        // given
        String shareId = "test-share-123";
        String userId = "user456";
        ReviewRoleType role = ReviewRoleType.WRITER; // REVIEWER가 아님

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        doNothing().when(webSocketMessageService).validateShareId(shareId, shareId);
        doThrow(new BaseException(WebSocketErrorCode.ROLE_MISMATCH))
                .when(webSocketMessageService).validateRole(role, ReviewRoleType.REVIEWER, shareId, shareId);

        // when & then
        assertThatThrownBy(() ->
            webSocketMessageController.subscribeReviewerCoverLetter(shareId, headerAccessor)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.ROLE_MISMATCH);
    }

    @Test
    @DisplayName("Writer가 텍스트 업데이트를 정상적으로 전송한다")
    void updateText_Success() {
        // given
        String shareId = "test-share-123";
        String userId = "user123";
        ReviewRoleType role = ReviewRoleType.WRITER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        TextUpdateRequest request = new TextUpdateRequest(
                1L,      // version
                0,       // startIdx
                10,      // endIdx
                "Updated text"
        );

        doNothing().when(webSocketMessageService)
                .handleTextUpdate(shareId, shareId, userId, role, request);

        // when
        webSocketMessageController.updateText(shareId, request, headerAccessor);

        // then
        verify(webSocketMessageService).handleTextUpdate(shareId, shareId, userId, role, request);
    }

    @Test
    @DisplayName("텍스트 업데이트 시 세션 속성이 null이면 예외가 발생한다")
    void updateText_NullSessionAttributes_ThrowsException() {
        // given
        headerAccessor.setSessionAttributes(null);
        String shareId = "test-share-123";
        TextUpdateRequest request = new TextUpdateRequest(1L, 0, 10, "text");

        // when & then
        assertThatThrownBy(() ->
            webSocketMessageController.updateText(shareId, request, headerAccessor)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.INVALID_SESSION);

        verifyNoInteractions(webSocketMessageService);
    }

    @Test
    @DisplayName("텍스트 업데이트 시 shareId가 일치하지 않으면 서비스 레이어에서 검증한다")
    void updateText_ShareIdMismatch_ServiceValidates() {
        // given
        String pathShareId = "path-share-123";
        String sessionShareId = "session-share-456";
        String userId = "user123";
        ReviewRoleType role = ReviewRoleType.WRITER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, sessionShareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        TextUpdateRequest request = new TextUpdateRequest(1L, 0, 10, "text");

        doThrow(new BaseException(WebSocketErrorCode.SHARE_ID_MISMATCH))
                .when(webSocketMessageService)
                .handleTextUpdate(pathShareId, sessionShareId, userId, role, request);

        // when & then
        assertThatThrownBy(() ->
            webSocketMessageController.updateText(pathShareId, request, headerAccessor)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.SHARE_ID_MISMATCH);

        verify(webSocketMessageService).handleTextUpdate(pathShareId, sessionShareId, userId, role, request);
    }

    @Test
    @DisplayName("텍스트 업데이트 시 REVIEWER는 권한이 없어 서비스 레이어에서 예외가 발생한다")
    void updateText_ReviewerUnauthorized_ServiceThrowsException() {
        // given
        String shareId = "test-share-123";
        String userId = "user456";
        ReviewRoleType role = ReviewRoleType.REVIEWER;

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        TextUpdateRequest request = new TextUpdateRequest(1L, 0, 10, "text");

        doThrow(new BaseException(WebSocketErrorCode.UNAUTHORIZED_TEXT_UPDATE))
                .when(webSocketMessageService)
                .handleTextUpdate(shareId, shareId, userId, role, request);

        // when & then
        assertThatThrownBy(() ->
            webSocketMessageController.updateText(shareId, request, headerAccessor)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.UNAUTHORIZED_TEXT_UPDATE);

        verify(webSocketMessageService).handleTextUpdate(shareId, shareId, userId, role, request);
    }

    @Test
    @DisplayName("세션 속성이 null일 때 예외가 발생한다.")
    void subscribeWriterCoverLetter_NullSessionAttributes_ValidatesWithNull() {
        // given
        headerAccessor.setSessionAttributes(null);
        String shareId = "test-share-123";

        // then - 세션이 null이어도 서비스의 validateShareId는 호출됨 (null 파라미터로)
        assertThatThrownBy(() ->
                webSocketMessageController.subscribeWriterCoverLetter(shareId, headerAccessor)
        ).isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.INVALID_SESSION);
    }
}