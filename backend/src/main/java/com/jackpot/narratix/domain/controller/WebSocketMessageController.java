package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.dto.WebSocketSessionInfo;
import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.WebSocketErrorCode;
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

    @SubscribeMapping("/share/{shareId}/review/writer")
    public void subscribeWriterCoverLetter(
            @DestinationVariable String shareId,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        handleSubscription(shareId, headerAccessor, ReviewRoleType.WRITER);
    }

    @SubscribeMapping("/share/{shareId}/review/reviewer")
    public void subscribeReviewerCoverLetter(
            @DestinationVariable String shareId,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        handleSubscription(shareId, headerAccessor, ReviewRoleType.REVIEWER);
    }

    private void handleSubscription(String shareId, SimpMessageHeaderAccessor headerAccessor, ReviewRoleType expectedRole){
        WebSocketSessionInfo sessionInfo = extractSessionInfo(headerAccessor);
        this.validateShareId(shareId, sessionInfo.shareId());
        this.validateRole(sessionInfo.role(), expectedRole, shareId, sessionInfo.shareId());
        log.info("User subscribed to share: shareId={}, userId={}, role={}", shareId, sessionInfo.userId(), expectedRole);
    }

    @MessageMapping("/share/{shareId}/text-update")
    public void updateText(
            @DestinationVariable String shareId,
            @Valid @Payload TextUpdateRequest request,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        log.info("Writer send text update request: shareId={}, request={}, path={}", shareId, request, headerAccessor.getDestination());

        WebSocketSessionInfo sessionInfo = extractSessionInfo(headerAccessor);

        validateShareId(shareId, sessionInfo.shareId());
        validateWriterRole(sessionInfo.role(), sessionInfo.userId(), shareId);

        log.info("Text update received: userId={}, shareId={}, version={}, startIdx={}, endIdx={}",
                sessionInfo.userId(), shareId, request.version(), request.startIdx(), request.endIdx());

        WebSocketMessageResponse response = WebSocketMessageResponse.createTextUpdateResponse(request);

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

    private void validateWriterRole(ReviewRoleType role, String userId, String shareId) {
        if (role != ReviewRoleType.WRITER) {
            log.warn("Unauthorized text update attempt: userId={}, role={}, shareId={}",
                    userId, role, shareId);
            throw new BaseException(WebSocketErrorCode.UNAUTHORIZED_TEXT_UPDATE);
        }
    }
}