package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.LabeledQnA;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public record LabeledQnAListResponse(
        List<CoverLetterResponse> coverLetters
) {
    public record CoverLetterResponse(
            List<LabeledQnAResponse> qnAs
    ) {
    }

    public record LabeledQnAResponse(
            String question,
            String answer,
            QuestionCategoryType questionCategory,
            Integer answerSize
    ) {
        public static LabeledQnAResponse of(LabeledQnA qna) {
            String answer = qna.getAnswer();
            return new LabeledQnAResponse(
                    qna.getQuestion(),
                    answer,
                    qna.getQuestionCategory(),
                    answer != null ? answer.length() : 0
            );
        }
    }

    public static LabeledQnAListResponse of(List<LabeledQnA> allQnAs) {
        if (allQnAs == null || allQnAs.isEmpty()) {
            return new LabeledQnAListResponse(List.of());
        }
        
        Map<String, List<LabeledQnAResponse>> map = new LinkedHashMap<>();

        for (LabeledQnA qna : allQnAs) {
            String fileId = qna.getUploadFile().getId();
            map.computeIfAbsent(fileId, k -> new ArrayList<>())
                    .add(LabeledQnAResponse.of(qna));
        }

        List<CoverLetterResponse> coverLetters = map.values().stream()
                .map(CoverLetterResponse::new)
                .toList();

        return new LabeledQnAListResponse(coverLetters);
    }
}