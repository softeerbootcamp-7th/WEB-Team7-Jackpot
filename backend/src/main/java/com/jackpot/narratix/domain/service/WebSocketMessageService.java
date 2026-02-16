package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.WebSocketErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketMessageService {

    private final WebSocketMessageSender webSocketMessageSender;

    public void validateShareId(String shareId, String sessionShareId) {
        if (!shareId.equals(sessionShareId)) {
            log.warn("ShareId mismatch during subscription: shareId={}, sessionShareId={}", shareId, sessionShareId);
            throw new BaseException(WebSocketErrorCode.SHARE_ID_MISMATCH);
        }
    }

    public void validateRole(ReviewRoleType role, ReviewRoleType expectedRole, String shareId, String sessionShareId) {
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

    public void validateWriterRole(ReviewRoleType role, String userId, String shareId) {
        if (role != ReviewRoleType.WRITER) {
            log.warn("Unauthorized text update attempt: userId={}, role={}, shareId={}",
                    userId, role, shareId);
            throw new BaseException(WebSocketErrorCode.UNAUTHORIZED_TEXT_UPDATE);
        }
    }

    public void handleTextUpdate(
            String shareId,
            Long qnAId,
            String sessionShareId,
            String userId,
            ReviewRoleType role,
            TextUpdateRequest request
    ) {
        validateShareId(shareId, sessionShareId);
        validateWriterRole(role, userId, shareId);

        log.info("Text update received: userId={}, shareId={}, qnAId={}, version={}, startIdx={}, endIdx={}",
                userId, shareId, qnAId, request.version(), request.startIdx(), request.endIdx());

        WebSocketMessageResponse response = WebSocketMessageResponse.createTextUpdateResponse(qnAId, request);

        webSocketMessageSender.sendMessageToReviewer(shareId, response);
    }
}