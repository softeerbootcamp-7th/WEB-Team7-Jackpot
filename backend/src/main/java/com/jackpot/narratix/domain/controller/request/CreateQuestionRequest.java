package com.jackpot.narratix.domain.controller.request;

import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import jakarta.validation.constraints.NotNull;

public record CreateQuestionRequest(
        @NotNull(message = "질문은 필수 입력 항목입니다.") String question,
        @NotNull(message = "문항 유형은 필수 입력 항목입니다.") QuestionCategoryType category
) {

    public CreateQuestionRequest(String question, String category) {
        this(question, QuestionCategoryType.fromDescription(category));
    }
}
