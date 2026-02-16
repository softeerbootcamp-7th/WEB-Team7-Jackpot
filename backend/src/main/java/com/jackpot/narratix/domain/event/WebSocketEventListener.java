package com.jackpot.narratix.domain.event;

import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;
import com.jackpot.narratix.domain.entity.ShareLink;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.entity.enums.WebSocketMessageType;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.domain.service.ShareLinkLockManager;
import com.jackpot.narratix.domain.service.ShareLinkService;
import com.jackpot.narratix.domain.service.WebSocketMessageSender;
import com.jackpot.narratix.domain.service.dto.WebSocketCreateCommentMessage;
import com.jackpot.narratix.domain.service.dto.WebSocketDeleteCommentMessage;
import com.jackpot.narratix.domain.service.dto.WebSocketEditCommentMessage;
import com.jackpot.narratix.global.websocket.WebSocketSessionAttributes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final WebSocketMessageSender webSocketMessageSender;
    private final ShareLinkLockManager shareLinkLockManager;
    private final ShareLinkService shareLinkService;

    private final UserRepository userRepository;

    @Async
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReviewCreatedEvent(ReviewCreatedEvent event) {
        // 활성화 된 ShareLink가 존재할 때만 첨삭 댓글 생성 웹소켓 메시지를 전송한다.
        Optional<ShareLink> shareLink = shareLinkService.getActiveShareLinkByCoverLetterId(event.coverLetterId());
        if (shareLink.isEmpty()) return;

        User reviewer = userRepository.findByIdOrElseThrow(event.reviewerId());
        WebSocketCreateCommentMessage message = WebSocketCreateCommentMessage.of(reviewer, event);
        webSocketMessageSender.sendMessageToShare(
                shareLink.get().getShareId(),
                new WebSocketMessageResponse(WebSocketMessageType.REVIEW_CREATED, message)
        );
    }

    @Async
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReviewEditEvent(ReviewEditEvent event) {
        // 활성화 된 ShareLink가 존재할 때만 첨삭 댓글 수정 웹소켓 메시지를 전송한다.
        Optional<ShareLink> shareLink = shareLinkService.getActiveShareLinkByCoverLetterId(event.coverLetterId());
        if (shareLink.isEmpty()) return;

        WebSocketEditCommentMessage message = WebSocketEditCommentMessage.of(event);
        webSocketMessageSender.sendMessageToShare(
                shareLink.get().getShareId(),
                new WebSocketMessageResponse(WebSocketMessageType.REVIEW_UPDATED, message)
        );
    }

    @Async
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReviewDeleteEvent(ReviewDeleteEvent event) {
        // 활성화 된 ShareLink가 존재할 때만 첨삭 댓글 삭제 웹소켓 메시지를 전송한다.
        Optional<ShareLink> shareLink = shareLinkService.getActiveShareLinkByCoverLetterId(event.coverLetterId());
        if (shareLink.isEmpty()) return;

        WebSocketDeleteCommentMessage message = new WebSocketDeleteCommentMessage(event.reviewId());
        webSocketMessageSender.sendMessageToShare(
                shareLink.get().getShareId(),
                new WebSocketMessageResponse(WebSocketMessageType.REVIEW_DELETED, message)
        );
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> attributes = headerAccessor.getSessionAttributes();

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