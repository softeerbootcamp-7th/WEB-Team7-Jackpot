package com.jackpot.narratix.domain.controller.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateScrapRequest(
        @NotNull(message = "스크랩할 문항 ID는 필수입니다.")
        @Positive(message = "문항 ID는 1이상이어야 합니다.")
        Long qnaId
) {
}