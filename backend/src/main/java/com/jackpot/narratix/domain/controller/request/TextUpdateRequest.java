package com.jackpot.narratix.domain.controller.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record TextUpdateRequest(
        @NotNull(message = "버전은 필수입니다.")
        @PositiveOrZero(message = "버전은 0 이상이어야 합니다.")
        Long version,

        @NotNull(message = "시작 인덱스는 필수입니다.")
        @PositiveOrZero(message = "시작 인덱스는 0 이상이어야 합니다.")
        Integer startIdx,

        @NotNull(message = "종료 인덱스는 필수입니다.")
        @PositiveOrZero(message = "종료 인덱스는 0 이상이어야 합니다.")
        Integer endIdx,

        @NotNull(message = "대체 텍스트는 필수입니다.")
        String replacedText
) {
    public TextUpdateRequest {
        if (startIdx != null && endIdx != null && startIdx > endIdx) {
            throw new IllegalArgumentException("시작 인덱스는 종료 인덱스보다 작거나 같아야 합니다.");
        }
    }
}