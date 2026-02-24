package com.jackpot.narratix.domain.controller.request;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CoverLettersSaveRequest(
        @Valid @NotNull @Size(min = 1, max = 3) List<CoverLetterAndQnASaveRequest> coverLetters
) {
    public record CoverLetterAndQnASaveRequest(
            @Valid @NotNull CoverLetterSaveRequest coverLetter,
            @Valid @NotNull @Size(min = 1, max = 10) List<QnASaveRequest> qnAs
    ) {
        public record CoverLetterSaveRequest(
                @NotNull String companyName,
                @NotNull String jobPosition,
                @NotNull Integer applyYear,
                @NotNull ApplyHalfType applyHalf,
                @NotNull LocalDate deadline
        ) {
        }

        public record QnASaveRequest(
                @NotNull String question,
                @NotNull String answer,
                @NotNull QuestionCategoryType questionCategory
        ) {
        }
    }

    public List<CoverLetter> toEntity(String userId){
        return coverLetters.stream()
                .map(request -> {
                    CoverLetterAndQnASaveRequest.CoverLetterSaveRequest coverLetterReq = request.coverLetter();
                    List<CoverLetterAndQnASaveRequest.QnASaveRequest> qnAsReq = request.qnAs();

                    CoverLetter coverLetter = CoverLetter.builder()
                            .userId(userId)
                            .companyName(coverLetterReq.companyName())
                            .jobPosition(coverLetterReq.jobPosition())
                            .applyYear(coverLetterReq.applyYear())
                            .applyHalf(coverLetterReq.applyHalf())
                            .deadline(coverLetterReq.deadline())
                            .build();
                    List<QnA> qnAs = qnAsReq.stream()
                            .map(qnaReq -> QnA.builder()
                                    .userId(userId)
                                    .questionCategory(qnaReq.questionCategory())
                                    .question(qnaReq.question())
                                    .answer(qnaReq.answer())
                                    .build())
                            .toList();

                    coverLetter.addQnAs(qnAs);
                    return coverLetter;
                })
                .toList();
    }
}
