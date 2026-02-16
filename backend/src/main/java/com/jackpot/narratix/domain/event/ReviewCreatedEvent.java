package com.jackpot.narratix.domain.event;

import com.jackpot.narratix.domain.entity.Review;

import java.time.LocalDateTime;

public record ReviewCreatedEvent(
        Long coverLetterId,
        String reviewerId,
        Long reviewId,
        String originText,
        String suggest,
        String comment,
        LocalDateTime createdAt
) {

    public static ReviewCreatedEvent of(Long coverLetterId, Review review){
        return new ReviewCreatedEvent(
                coverLetterId,
                review.getReviewerId(),
                review.getId(),
                review.getOriginText(),
                review.getSuggest(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}