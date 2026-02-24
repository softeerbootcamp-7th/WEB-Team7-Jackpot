package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.LabeledQnA;
import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;

import java.util.List;

public record LabeledQnAListResponse(
        List<CoverLetterResponse> coverLetters
) {
    public record CoverLetterResponse(
            List<LabeledQnAResponse> qnAs
    ) {
        public static CoverLetterResponse of(UploadFile uploadFile) {
            return new CoverLetterResponse(
                    uploadFile.getLabeledQnAs().stream()
                            .map(LabeledQnAResponse::of)
                            .toList()
            );
        }
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

    public static LabeledQnAListResponse of(List<UploadFile> uploadFiles) {
        if (uploadFiles == null || uploadFiles.isEmpty()) {
            return new LabeledQnAListResponse(List.of());
        }

        List<CoverLetterResponse> coverLetters = uploadFiles.stream()
                .map(CoverLetterResponse::of)
                .toList();

        return new LabeledQnAListResponse(coverLetters);
    }


}