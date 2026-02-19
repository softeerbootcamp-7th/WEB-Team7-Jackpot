package com.jackpot.narratix.domain.service.dto;

import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;

public record LabeledQnARequest(
        String question,
        String answer,
        QuestionCategoryType questionCategory // JSON의 키값과 정확히 일치
) {
}