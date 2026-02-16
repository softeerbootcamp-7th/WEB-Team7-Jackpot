package com.jackpot.narratix.domain.event;

import com.jackpot.narratix.domain.entity.Review;

import java.time.LocalDateTime;

public record ReviewEditEvent(
        Long coverLetterId,
        Long qnAId,
        Long reviewId,
        String reviewerId,
        String originText,
        String suggest,
        String comment,
        LocalDateTime modifiedAt
) {
    public static ReviewEditEvent of(Long coverLetterId, Long qnAId, Review review) {
        return new ReviewEditEvent(
                coverLetterId,
                qnAId,
                review.getId(),
                review.getReviewerId(),
                review.getOriginText(),
                review.getSuggest(),
                review.getComment(),
                review.getModifiedAt()
        );
    }
}
