package com.jackpot.narratix.domain.controller.request;

import jakarta.validation.constraints.NotNull;

public record QnAEditRequest(
        @NotNull(message = "QnA ID는 필수 입력 항목입니다.") Long qnAId,
        @NotNull(message = "답변은 필수 입력 항목입니다.") String answer
) {
}
