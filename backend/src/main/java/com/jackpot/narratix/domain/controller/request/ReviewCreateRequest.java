package com.jackpot.narratix.domain.controller.request;

import com.jackpot.narratix.domain.entity.Review;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ReviewCreateRequest(
        @NotNull(message = "version은 필수 입력 항목입니다.") Long version,
        @NotNull(message = "시작 인덱스는 필수 입력 항목입니다.")
        @PositiveOrZero(message = "startIdx는 0이거나 양수여야 합니다.") Long startIdx,
        @NotNull(message = "끝 인덱스는 필수 입력 항목입니다.")
        @PositiveOrZero(message = "endIdx는 0이거나 양수여야 합니다.") Long endIdx,
        @NotNull(message = "originText는 필수 입력 항목입니다.") String originText,
        String suggest,
        String comment
) {

    public Review toEntity(String userId, Long qnaId) {
        return Review.builder()
                .reviewerId(userId)
                .qnaId(qnaId)
                .suggest(suggest)
                .comment(comment)
                .build();
    }
}
