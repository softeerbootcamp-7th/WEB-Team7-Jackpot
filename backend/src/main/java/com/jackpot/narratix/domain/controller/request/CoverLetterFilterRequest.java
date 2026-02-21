package com.jackpot.narratix.domain.controller.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CoverLetterFilterRequest(
        LocalDate startDate,
        LocalDate endDate,
        @NotNull(message = "size는 필수 입력 항목입니다.") Integer size,
        Long lastCoverLetterId,
        Boolean isShared
) {
}
