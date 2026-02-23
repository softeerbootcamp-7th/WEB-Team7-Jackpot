package com.jackpot.narratix.domain.service.dto;

import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.event.ReviewCreatedEvent;

import java.time.LocalDateTime;

public record WebSocketCreateReviewMessage(
        Sender sender,
        Long reviewId,
        String originText,
        String suggest,
        String comment,
        LocalDateTime createdAt
) {

    public static WebSocketCreateReviewMessage of(User reviewer, ReviewCreatedEvent event) {
        return new WebSocketCreateReviewMessage(
                WebSocketCreateReviewMessage.Sender.of(reviewer),
                event.reviewId(),
                event.originText(),
                event.suggest(),
                event.comment(),
                event.createdAt()
        );
    }

    public record Sender(
            String id,
            String nickname
    ) {
        public static Sender of(User user) {
            return new Sender(user.getId(), user.getNickname());
        }
    }
}
