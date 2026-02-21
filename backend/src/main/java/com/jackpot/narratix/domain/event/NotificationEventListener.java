package com.jackpot.narratix.domain.event;

import com.jackpot.narratix.global.sse.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final SseEmitterService sseEmitterService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleNotificationSendEvent(NotificationSendEvent event) {
        sseEmitterService.send(
                event.receiverId(),
                event.notificationSendResponse()
        );
    }
}