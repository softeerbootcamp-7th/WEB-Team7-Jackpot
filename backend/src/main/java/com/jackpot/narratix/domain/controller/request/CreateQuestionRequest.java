package com.jackpot.narratix.domain.controller.request;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import jakarta.validation.constraints.NotNull;

public record CreateQuestionRequest(
        @NotNull(message = "질문은 필수 입력 항목입니다.") String question,
        @NotNull(message = "문항유형은 필수 입력 항목입니다.") QuestionCategoryType category
) {
    @JsonCreator
    public CreateQuestionRequest(
            @JsonProperty("question") String question,
            @JsonProperty("category") String category
    ) {
        this(question, QuestionCategoryType.fromDescription(category));
    }
}
