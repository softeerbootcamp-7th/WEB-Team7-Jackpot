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
import com.jackpot.narratix.domain.service.dto.WebSocketCreateReviewMessage;
import com.jackpot.narratix.domain.service.dto.WebSocketDeleteReviewMessage;
import com.jackpot.narratix.domain.service.dto.WebSocketEditReviewMessage;

import com.jackpot.narratix.domain.service.dto.WebSocketTextReplaceAllMessage;
import com.jackpot.narratix.global.exception.BaseException;
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
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

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
        Optional<ShareLink> shareLink = shareLinkService.getActiveShareLinkByCoverLetterId(event.coverLetterId());
        if (shareLink.isEmpty()) return;

        User reviewer = userRepository.findByIdOrElseThrow(event.reviewerId());
        WebSocketCreateReviewMessage message = WebSocketCreateReviewMessage.of(reviewer, event);
        webSocketMessageSender.sendMessageToShare(
                shareLink.get().getShareId(),
                new WebSocketMessageResponse(WebSocketMessageType.REVIEW_CREATED, event.qnAId(), message)
        );
    }

    @Async
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReviewEditEvent(ReviewEditEvent event) {
        Optional<ShareLink> shareLink = shareLinkService.getActiveShareLinkByCoverLetterId(event.coverLetterId());
        if (shareLink.isEmpty()) return;

        WebSocketEditReviewMessage message = WebSocketEditReviewMessage.of(event);
        webSocketMessageSender.sendMessageToShare(
                shareLink.get().getShareId(),
                new WebSocketMessageResponse(WebSocketMessageType.REVIEW_UPDATED, event.qnAId(), message)
        );
    }

    @Async
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReviewDeleteEvent(ReviewDeleteEvent event) {
        Optional<ShareLink> shareLink = shareLinkService.getActiveShareLinkByCoverLetterId(event.coverLetterId());
        if (shareLink.isEmpty()) return;

        WebSocketDeleteReviewMessage message = new WebSocketDeleteReviewMessage(event.reviewId());
        webSocketMessageSender.sendMessageToShare(
                shareLink.get().getShareId(),
                new WebSocketMessageResponse(WebSocketMessageType.REVIEW_DELETED, event.qnAId(), message)
        );
    }

    @Async
    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTextReplaceAllEvent(TextReplaceAllEvent event) {
        Optional<ShareLink> shareLink = shareLinkService.getActiveShareLinkByCoverLetterId(event.coverLetterId());
        if (shareLink.isEmpty()) return;

        WebSocketTextReplaceAllMessage message = WebSocketTextReplaceAllMessage.of(event);

        webSocketMessageSender.sendMessageToShare(
                shareLink.get().getShareId(),
                new WebSocketMessageResponse(WebSocketMessageType.TEXT_REPLACE_ALL, event.qnAId(), message)
        );
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        log.info("웹소켓 연결 종료. sessionId={}", sessionId);

        try {
            StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
            Map<String, Object> attributes = headerAccessor.getSessionAttributes();
            if (attributes != null) {
                ReviewRoleType role = WebSocketSessionAttributes.getRole(attributes);
                String shareId = WebSocketSessionAttributes.getShareId(attributes);
                // Writer 연결 종료 시 pending 델타를 DB에 flush해 TTL 만료로 인한 데이터 유실 방지
                if (role == ReviewRoleType.WRITER && shareId != null) {
                    shareLinkService.flushPendingDeltasByShareId(shareId);
                }
            }
        } catch (BaseException e) {
            log.warn("Writer disconnect flush 중단: sessionId={}, 원인={}", sessionId, e.getMessage());
        } catch (Exception e) {
            log.error("Writer disconnect flush 실패: sessionId={}", sessionId, e);
        }

        try {
            shareLinkLockManager.unlock(sessionId);
        } catch (BaseException e) {
            log.warn("Lock 해제 중 예외 발생: sessionId={}, 원인={}", sessionId, e.getMessage());
        } catch (Exception e) {
            log.error("Failed to release lock on disconnect: sessionId={}", sessionId, e);
        }
    }

    @EventListener
    public void handleWebSocketUnsubscribeListener(SessionUnsubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> attributes = headerAccessor.getSessionAttributes();

        String userId = WebSocketSessionAttributes.getUserId(attributes);
        String shareId = WebSocketSessionAttributes.getShareId(attributes);
        ReviewRoleType role = WebSocketSessionAttributes.getRole(attributes);
        String destination = headerAccessor.getDestination();

        log.info("웹소켓 구독 해제. UserId: {}, ShareId: {}, Role: {}, Destination: {}",
                userId, shareId, role, destination);
    }
}