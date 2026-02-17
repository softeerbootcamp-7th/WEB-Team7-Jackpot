package com.jackpot.narratix.domain.controller.request;

import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CoverLetterAndQnAEditRequest(
        @Valid CoverLetterEditRequest coverLetter,
        @Valid List<QnAEditRequest> questions
) {

    public record CoverLetterEditRequest(
            @NotNull(message = "자기소개서 아이디는 필수 입력 항목입니다.") Long coverLetterId,
            @NotNull(message = "기업명은 필수 입력 항목입니다.") String companyName,
            @NotNull(message = "채용년도는 필수 입력 항목입니다.") Integer applyYear,
            @NotNull(message = "채용분기는 필수 입력 항목입니다.") ApplyHalfType applyHalf,
            @NotNull(message = "직무명은 필수 입력 항목입니다.") String jobPosition,
            @Nullable LocalDate deadline
    ) {
    }

    public record QnAEditRequest(
            @NotNull(message = "QnA 아이디는 필수 입력 항목입니다.") Long qnAId,
            @NotNull(message = "질문은 필수 입력 항목입니다.") String question,
            @NotNull(message = "문항 유형은 필수 입력 항목입니다.") String category
    ) {
    }
}
