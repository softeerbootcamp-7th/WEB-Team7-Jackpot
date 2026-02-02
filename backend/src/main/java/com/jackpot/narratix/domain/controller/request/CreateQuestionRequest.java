package com.jackpot.narratix.domain.controller.request;

import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import jakarta.validation.constraints.NotNull;

public record CreateQuestionRequest(@NotNull String question, @NotNull QuestionCategoryType category) {

    public CreateQuestionRequest(String question, String category) {
        this(question, QuestionCategoryType.fromDescription(category));
    }
}
