package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.dto.WebSocketSessionInfo;
import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.WebSocketErrorCode;
import com.jackpot.narratix.domain.service.WebSocketMessageService;
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

    private final WebSocketMessageService webSocketMessageService;

    @SubscribeMapping("/share/{shareId}/review/writer")
    public void subscribeWriterCoverLetter(
            @DestinationVariable String shareId,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        WebSocketSessionInfo sessionInfo = extractSessionInfo(headerAccessor);

        webSocketMessageService.validateShareId(shareId, sessionInfo.shareId());
        webSocketMessageService.validateRole(sessionInfo.role(), ReviewRoleType.WRITER, shareId, sessionInfo.shareId());

        log.info("User subscribed to share: shareId={}, userId={}", shareId, sessionInfo.userId());
    }

    @SubscribeMapping("/share/{shareId}/review/reviewer")
    public void subscribeReviewerCoverLetter(
            @DestinationVariable String shareId,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        WebSocketSessionInfo sessionInfo = extractSessionInfo(headerAccessor);

        webSocketMessageService.validateShareId(shareId, sessionInfo.shareId());
        webSocketMessageService.validateRole(sessionInfo.role(), ReviewRoleType.REVIEWER, shareId, sessionInfo.shareId());

        log.info("User subscribed to share: shareId={}, userId={}", shareId, sessionInfo.userId());
    }

    @MessageMapping("/share/{shareId}/text-update")
    public void updateText(
            @DestinationVariable String shareId,
            @Valid @Payload TextUpdateRequest request,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        log.info("Writer send text update request: shareId={}, request={}, path={}", shareId, request, headerAccessor.getDestination());

        WebSocketSessionInfo sessionInfo = extractSessionInfo(headerAccessor);

        webSocketMessageService.handleTextUpdate(shareId, sessionInfo.shareId(), sessionInfo.userId(), sessionInfo.role(), request);
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
}