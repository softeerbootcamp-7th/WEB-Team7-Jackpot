package com.jackpot.narratix.domain.service.dto;

import com.jackpot.narratix.domain.event.ReviewEditEvent;

import java.time.LocalDateTime;

public record WebSocketEditReviewMessage(
        Long reviewId,
        String originText,
        String suggest,
        String content,
        LocalDateTime modifiedAt
) {
    public static WebSocketEditReviewMessage of(ReviewEditEvent event) {
        return new WebSocketEditReviewMessage(
                event.reviewId(),
                event.originText(),
                event.suggest(),
                event.comment(),
                event.modifiedAt()
        );
    }
}
