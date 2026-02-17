package com.jackpot.narratix.domain.controller.response;

import lombok.Builder;

@Builder
public record TotalCoverLetterCountResponse(
        Integer coverLetterCount,
        Integer qnaCount,
        Integer seasonCoverLetterCount
) {
}
