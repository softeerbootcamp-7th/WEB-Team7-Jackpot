package com.jackpot.narratix.domain.event;

import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;
import com.jackpot.narratix.domain.entity.ShareLink;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.WebSocketMessageType;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.domain.service.ShareLinkLockManager;
import com.jackpot.narratix.domain.service.ShareLinkService;
import com.jackpot.narratix.domain.service.WebSocketMessageSender;
import com.jackpot.narratix.domain.service.dto.WebSocketCreateReviewMessage;
import com.jackpot.narratix.domain.service.dto.WebSocketDeleteReviewMessage;
import com.jackpot.narratix.domain.service.dto.WebSocketEditReviewMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

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
        // 활성화 된 ShareLink가 존재할 때만 첨삭 댓글 수정 웹소켓 메시지를 전송한다.
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
        // 활성화 된 ShareLink가 존재할 때만 첨삭 댓글 삭제 웹소켓 메시지를 전송한다.
        Optional<ShareLink> shareLink = shareLinkService.getActiveShareLinkByCoverLetterId(event.coverLetterId());
        if (shareLink.isEmpty()) return;

        WebSocketDeleteReviewMessage message = new WebSocketDeleteReviewMessage(event.reviewId());
        webSocketMessageSender.sendMessageToShare(
                shareLink.get().getShareId(),
                new WebSocketMessageResponse(WebSocketMessageType.REVIEW_DELETED, event.qnAId(), message)
        );
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();

        log.info("웹소켓 연결 종료. sessionId={}", sessionId);

        // sessionId로 lockKey를 조회하여 락 해제 및 세션 목록에서 제거
        shareLinkLockManager.unlock(sessionId);
    }
}