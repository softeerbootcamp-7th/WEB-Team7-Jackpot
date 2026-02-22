package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.dto.WebSocketSessionInfo;
import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.controller.response.TextUpdateResponse;
import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.entity.enums.WebSocketMessageType;
import com.jackpot.narratix.domain.exception.SerializationException;
import com.jackpot.narratix.domain.exception.VersionConflictException;
import com.jackpot.narratix.domain.exception.WebSocketErrorCode;
import com.jackpot.narratix.domain.service.TextDeltaService;
import com.jackpot.narratix.domain.service.TextSyncService;
import com.jackpot.narratix.domain.service.WebSocketMessageSender;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.websocket.WebSocketSessionAttributes;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketMessageController {

    private final WebSocketMessageSender webSocketMessageSender;
    private final TextDeltaService textDeltaService;
    private final TextSyncService textSyncService;

    @SubscribeMapping("/share/{shareId}/qna/{qnAId}/review/writer")
    public void subscribeWriterCoverLetter(
            @DestinationVariable String shareId,
            @DestinationVariable Long qnAId,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        handleSubscription(shareId, qnAId, headerAccessor, ReviewRoleType.WRITER);
    }

    @SubscribeMapping("/share/{shareId}/qna/{qnAId}/review/reviewer")
    public void subscribeReviewerCoverLetter(
            @DestinationVariable String shareId,
            @DestinationVariable Long qnAId,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        handleSubscription(shareId, qnAId, headerAccessor, ReviewRoleType.REVIEWER);
    }

    private void handleSubscription(String shareId, Long qnAId, SimpMessageHeaderAccessor headerAccessor, ReviewRoleType expectedRole) {
        WebSocketSessionInfo sessionInfo = extractSessionInfo(headerAccessor);
        this.validateShareId(shareId, sessionInfo.shareId());
        this.validateRole(sessionInfo.role(), expectedRole, shareId, sessionInfo.shareId());
        log.info("User subscribed to share: shareId={}, qnAId={}, userId={}, role={}",
                shareId, qnAId, sessionInfo.userId(), expectedRole);
    }

    private void validateShareId(String shareId, String sessionShareId) {
        if (!shareId.equals(sessionShareId)) {
            log.warn("ShareId mismatch during subscription: shareId={}, sessionShareId={}", shareId, sessionShareId);
            throw new BaseException(WebSocketErrorCode.SHARE_ID_MISMATCH);
        }
    }

    private void validateRole(ReviewRoleType role, ReviewRoleType expectedRole, String shareId, String sessionShareId) {
        if (!expectedRole.equals(role)) {
            log.warn("Role mismatch during subscription: expected Role={}, actual Role={}, path={}, session={}",
                    expectedRole,
                    role,
                    shareId,
                    sessionShareId
            );
            throw new BaseException(WebSocketErrorCode.ROLE_MISMATCH);
        }
    }

    @MessageMapping("/share/{shareId}/qna/{qnAId}/text-update")
    public void updateText(
            @DestinationVariable String shareId,
            @DestinationVariable Long qnAId,
            @Valid @Payload TextUpdateRequest request,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        log.info("Writer send text update request: shareId={}, qnAId={}, request={}, path={}", shareId, qnAId, request, headerAccessor.getDestination());

        WebSocketSessionInfo sessionInfo = extractSessionInfo(headerAccessor);

        validateShareId(shareId, sessionInfo.shareId());
        validateWriterRole(sessionInfo.role(), sessionInfo.userId(), shareId);

        log.info("Text update received: userId={}, shareId={}, startIdx={}, endIdx={}",
                sessionInfo.userId(), shareId, request.startIdx(), request.endIdx());

        long deltaVersion;
        try {
            deltaVersion = textDeltaService.saveAndMaybeFlush(qnAId, request);
        } catch (VersionConflictException e) { // delta push 미발생 — rollback 없이 현재 상태를 TEXT_REPLACE_ALL로 전송
            log.warn("버전 충돌, TEXT_REPLACE_ALL 전송: shareId={}, qnAId={}", shareId, qnAId);
            try {
                WebSocketMessageResponse response = textSyncService.recoverTextReplaceAll(qnAId);
                webSocketMessageSender.sendMessageToShare(shareId, response);
            } catch (Exception re) {
                log.error("recoverTextReplaceAll 실패: shareId={}, qnAId={}", shareId, qnAId, re);
            }
            return;
        } catch (SerializationException e) { // delta push 미발생 — rollback 없이 현재 상태를 TEXT_REPLACE_ALL로 전송
            log.error("TextUpdateRequest 직렬화 실패, TEXT_REPLACE_ALL 전송: shareId={}, qnAId={}", shareId, qnAId, e);
            try {
                WebSocketMessageResponse response = textSyncService.recoverTextReplaceAll(qnAId);
                webSocketMessageSender.sendMessageToShare(shareId, response);
            } catch (Exception re) {
                log.error("recoverTextReplaceAll 실패: shareId={}, qnAId={}", shareId, qnAId, re);
            }
            return;
        } catch (Exception e) {
            // delta push 이후 실패 — 마지막 push 롤백 후 TEXT_REPLACE_ALL 전송
            log.error("텍스트 업데이트 실패, rollback 후 TEXT_REPLACE_ALL 전송: shareId={}, qnAId={}", shareId, qnAId, e);
            try {
                WebSocketMessageResponse response = textSyncService.recoverTextReplaceAllWithRollback(qnAId);
                webSocketMessageSender.sendMessageToShare(shareId, response);
            } catch (Exception re) {
                log.error("recoverTextReplaceAllWithRollback 실패: shareId={}, qnAId={}", shareId, qnAId, re);
            }
            return;
        }
        TextUpdateResponse textUpdateResponse = TextUpdateResponse.of(deltaVersion, request);
        WebSocketMessageResponse response = new WebSocketMessageResponse(WebSocketMessageType.TEXT_UPDATE, qnAId, textUpdateResponse);
        webSocketMessageSender.sendMessageToReviewer(shareId, response);
    }

    private WebSocketSessionInfo extractSessionInfo(SimpMessageHeaderAccessor headerAccessor) {
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes == null) {
            log.warn("Session attributes is null");
            throw new BaseException(WebSocketErrorCode.INVALID_SESSION);
        }

        String shareId = WebSocketSessionAttributes.getShareId(sessionAttributes);
        String userId = WebSocketSessionAttributes.getUserId(sessionAttributes);
        ReviewRoleType role = WebSocketSessionAttributes.getRole(sessionAttributes);

        return new WebSocketSessionInfo(shareId, userId, role);
    }

    private void validateWriterRole(ReviewRoleType role, String userId, String shareId) {
        if (role != ReviewRoleType.WRITER) {
            log.warn("Unauthorized text update attempt: userId={}, role={}, shareId={}",
                    userId, role, shareId);
            throw new BaseException(WebSocketErrorCode.UNAUTHORIZED_TEXT_UPDATE);
        }
    }
}