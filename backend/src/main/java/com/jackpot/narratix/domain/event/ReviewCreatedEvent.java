package com.jackpot.narratix.domain.event;

import com.jackpot.narratix.domain.entity.Review;

import java.time.LocalDateTime;

public record ReviewCreatedEvent(
        Long coverLetterId,
        Long qnAId,
        String reviewerId,
        Long reviewId,
        String originText,
        String suggest,
        String comment,
        LocalDateTime createdAt
) {

    public static ReviewCreatedEvent of(Long coverLetterId, Long qnAId, Review review){
        return new ReviewCreatedEvent(
                coverLetterId,
                qnAId,
                review.getReviewerId(),
                review.getId(),
                review.getOriginText(),
                review.getSuggest(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}