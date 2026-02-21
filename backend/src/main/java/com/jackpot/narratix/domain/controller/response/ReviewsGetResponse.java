package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.User;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public record ReviewsGetResponse(
        List<ReviewResponse> reviews
) {

    public static ReviewsGetResponse emptyResponse(){
        return new ReviewsGetResponse(Collections.emptyList());
    }

    public record ReviewResponse(
            Long id,
            Sender sender,
            String originText,
            String comment,
            String suggest,
            boolean isApproved,
            LocalDateTime createdAt
    ) {
        public static ReviewResponse from(Review review, User sender){
            return new ReviewResponse(
                    review.getId(),
                    new Sender(sender.getId(), sender.getNickname()),
                    review.getOriginText(),
                    review.getComment(),
                    review.getSuggest(),
                    review.isApproved(),
                    review.getCreatedAt()
            );
        }

        public record Sender(
                String id,
                String nickname
        ) {
        }
    }
}
