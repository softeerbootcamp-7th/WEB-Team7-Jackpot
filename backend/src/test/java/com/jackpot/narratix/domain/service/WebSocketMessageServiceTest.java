package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.WebSocketErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WebSocketMessageServiceTest {

    @InjectMocks
    private WebSocketMessageService webSocketMessageService;

    @Mock
    private WebSocketMessageSender webSocketMessageSender;

    @Test
    @DisplayName("shareId가 일치하면 검증을 통과한다")
    void validateShareId_Match_Success() {
        // given
        String shareId = "test-share-123";
        String sessionShareId = "test-share-123";

        // when & then
        webSocketMessageService.validateShareId(shareId, sessionShareId);
        assertThatNoException();
    }

    @Test
    @DisplayName("shareId가 일치하지 않으면 예외가 발생한다")
    void validateShareId_Mismatch_ThrowsException() {
        // given
        String shareId = "test-share-123";
        String sessionShareId = "different-share-456";

        // when & then
        assertThatThrownBy(() ->
            webSocketMessageService.validateShareId(shareId, sessionShareId)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.SHARE_ID_MISMATCH);
    }

    @Test
    @DisplayName("role이 일치하면 검증을 통과한다")
    void validateRole_Match_Success() {
        // given
        ReviewRoleType role = ReviewRoleType.WRITER;
        ReviewRoleType expectedRole = ReviewRoleType.WRITER;
        String shareId = "test-share-123";
        String sessionShareId = "test-share-123";

        // when & then
        webSocketMessageService.validateRole(role, expectedRole, shareId, sessionShareId);
        assertThatNoException();
    }

    @Test
    @DisplayName("role이 일치하지 않으면 예외가 발생한다")
    void validateRole_Mismatch_ThrowsException() {
        // given
        ReviewRoleType role = ReviewRoleType.REVIEWER;
        ReviewRoleType expectedRole = ReviewRoleType.WRITER;
        String shareId = "test-share-123";
        String sessionShareId = "test-share-123";

        // when & then
        assertThatThrownBy(() ->
            webSocketMessageService.validateRole(role, expectedRole, shareId, sessionShareId)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.ROLE_MISMATCH);
    }

    @Test
    @DisplayName("Writer role은 검증을 통과한다")
    void validateWriterRole_Writer_Success() {
        // given
        ReviewRoleType role = ReviewRoleType.WRITER;
        String userId = "user123";
        String shareId = "test-share-123";

        // when & then
        webSocketMessageService.validateWriterRole(role, userId, shareId);
        assertThatNoException();
    }

    @Test
    @DisplayName("Reviewer role은 Writer 검증에서 예외가 발생한다")
    void validateWriterRole_Reviewer_ThrowsException() {
        // given
        ReviewRoleType role = ReviewRoleType.REVIEWER;
        String userId = "user123";
        String shareId = "test-share-123";

        // when & then
        assertThatThrownBy(() ->
            webSocketMessageService.validateWriterRole(role, userId, shareId)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.UNAUTHORIZED_TEXT_UPDATE);
    }

    @Test
    @DisplayName("텍스트 업데이트를 정상적으로 처리하고 Reviewer에게 메시지를 전송한다")
    void handleTextUpdate_Success() {
        // given
        String shareId = "test-share-123";
        Long qnAId = 1L;
        String sessionShareId = "test-share-123";
        String userId = "user123";
        ReviewRoleType role = ReviewRoleType.WRITER;

        TextUpdateRequest request = new TextUpdateRequest(
                1L,      // version
                0,       // startIdx
                10,      // endIdx
                "Updated text"
        );

        // when
        webSocketMessageService.handleTextUpdate(shareId, qnAId, sessionShareId, userId, role, request);

        // then
        ArgumentCaptor<WebSocketMessageResponse> responseCaptor =
                ArgumentCaptor.forClass(WebSocketMessageResponse.class);
        verify(webSocketMessageSender).sendMessageToReviewer(eq(shareId), responseCaptor.capture());

        WebSocketMessageResponse capturedResponse = responseCaptor.getValue();
        assertThat(capturedResponse).isNotNull();
        assertThat(capturedResponse.qnAId()).isEqualTo(qnAId);
        assertThat(capturedResponse.payload()).isEqualTo(request);
    }

    @Test
    @DisplayName("텍스트 업데이트 시 shareId가 일치하지 않으면 예외가 발생한다")
    void handleTextUpdate_ShareIdMismatch_ThrowsException() {
        // given
        String shareId = "test-share-123";
        Long qnAId = 1L;
        String sessionShareId = "different-share-456";
        String userId = "user123";
        ReviewRoleType role = ReviewRoleType.WRITER;

        TextUpdateRequest request = new TextUpdateRequest(1L, 0, 10, "text");

        // when & then
        assertThatThrownBy(() ->
            webSocketMessageService.handleTextUpdate(shareId, qnAId, sessionShareId, userId, role, request)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.SHARE_ID_MISMATCH);
    }

    @Test
    @DisplayName("텍스트 업데이트 시 REVIEWER는 권한이 없어 예외가 발생한다")
    void handleTextUpdate_ReviewerRole_ThrowsException() {
        // given
        String shareId = "test-share-123";
        Long qnAId = 1L;
        String sessionShareId = "test-share-123";
        String userId = "user456";
        ReviewRoleType role = ReviewRoleType.REVIEWER;

        TextUpdateRequest request = new TextUpdateRequest(1L, 0, 10, "text");

        // when & then
        assertThatThrownBy(() ->
            webSocketMessageService.handleTextUpdate(shareId, qnAId, sessionShareId, userId, role, request)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.UNAUTHORIZED_TEXT_UPDATE);
    }

    @Test
    @DisplayName("텍스트 업데이트 시 shareId 검증이 먼저 수행된다")
    void handleTextUpdate_ShareIdValidationFirst() {
        // given
        String shareId = "test-share-123";
        Long qnAId = 1L;
        String sessionShareId = "different-share-456";
        String userId = "user456";
        ReviewRoleType role = ReviewRoleType.REVIEWER; // REVIEWER이지만 shareId 검증이 먼저 실패해야 함

        TextUpdateRequest request = new TextUpdateRequest(1L, 0, 10, "text");

        // when & then - shareId 불일치 예외가 먼저 발생해야 함
        assertThatThrownBy(() ->
            webSocketMessageService.handleTextUpdate(shareId, qnAId, sessionShareId, userId, role, request)
        ).isInstanceOf(BaseException.class)
         .hasFieldOrPropertyWithValue("errorCode", WebSocketErrorCode.SHARE_ID_MISMATCH);
    }

    @Test
    @DisplayName("유효한 텍스트 업데이트는 WebSocketMessageResponse를 생성하여 전송한다")
    void handleTextUpdate_CreatesAndSendsResponse() {
        // given
        String shareId = "test-share-123";
        Long qnAId = 5L;
        String sessionShareId = "test-share-123";
        String userId = "writer-user";
        ReviewRoleType role = ReviewRoleType.WRITER;

        TextUpdateRequest request = new TextUpdateRequest(
                5L,
                100,
                150,
                "새로운 텍스트 내용"
        );

        // when
        webSocketMessageService.handleTextUpdate(shareId, qnAId, sessionShareId, userId, role, request);

        // then
        ArgumentCaptor<String> shareIdCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<WebSocketMessageResponse> responseCaptor =
                ArgumentCaptor.forClass(WebSocketMessageResponse.class);

        verify(webSocketMessageSender).sendMessageToReviewer(
                shareIdCaptor.capture(),
                responseCaptor.capture()
        );

        assertThat(shareIdCaptor.getValue()).isEqualTo(shareId);

        WebSocketMessageResponse response = responseCaptor.getValue();
        assertThat(response).isNotNull();
        assertThat(response.qnAId()).isEqualTo(qnAId);
        assertThat(response.payload()).isInstanceOf(TextUpdateRequest.class);

        TextUpdateRequest capturedPayload = (TextUpdateRequest) response.payload();
        assertThat(capturedPayload.version()).isEqualTo(5L);
        assertThat(capturedPayload.startIdx()).isEqualTo(100);
        assertThat(capturedPayload.endIdx()).isEqualTo(150);
        assertThat(capturedPayload.replacedText()).isEqualTo("새로운 텍스트 내용");
    }

    @Test
    @DisplayName("WRITER와 REVIEWER 모두 role 검증을 통과할 수 있다")
    void validateRole_BothRoles_Success() {
        // given
        String shareId = "test-share-123";
        String sessionShareId = "test-share-123";

        // when & then - WRITER
        webSocketMessageService.validateRole(
                ReviewRoleType.WRITER,
                ReviewRoleType.WRITER,
                shareId,
                sessionShareId
        );

        // when & then - REVIEWER
        webSocketMessageService.validateRole(
                ReviewRoleType.REVIEWER,
                ReviewRoleType.REVIEWER,
                shareId,
                sessionShareId
        );
        assertThatNoException();
    }
}