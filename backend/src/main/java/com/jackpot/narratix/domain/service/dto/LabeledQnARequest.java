package com.jackpot.narratix.domain.service.dto;

import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LabeledQnARequest(
        @NotBlank String question,
        @NotBlank String answer,
        @NotNull QuestionCategoryType questionCategory // JSON의 키값과 정확히 일치
) {
}