package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.LabeledQnA;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;

import java.util.List;

public record LabeledQnAListResponse(
        List<LabeledQnAResponse> qnaList
) {
    private record LabeledQnAResponse(
            String question,
            String answer,
            QuestionCategoryType questionCategory,
            Integer answerSize
    ) {
        private static LabeledQnAResponse of(LabeledQnA qna) {
            String answer = qna.getAnswer();
            return new LabeledQnAResponse(qna.getQuestion(), answer, qna.getQuestionCategory(), answer.length());
        }
    }

    public static LabeledQnAListResponse of(List<LabeledQnA> qnAs) {
        return new LabeledQnAListResponse(qnAs.stream().map(LabeledQnAResponse::of).toList());
    }
}
