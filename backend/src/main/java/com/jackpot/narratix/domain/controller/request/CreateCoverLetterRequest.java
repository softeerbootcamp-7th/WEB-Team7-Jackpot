package com.jackpot.narratix.domain.controller.request;

import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreateCoverLetterRequest(
        @NotNull(message = "기업명은 필수 입력 항목입니다.") String companyName,
        @NotNull(message = "채용년도는 필수 입력 항목입니다.") Integer applyYear,
        @NotNull(message = "채용분기는 필수 입력 항목입니다.") ApplyHalfType applyHalf,
        @NotNull(message = "직무명은 필수 입력 항목입니다.") String jobPosition,
        @Nullable LocalDate deadline,
        @NotNull(message = "질문은 필수 입력 항목입니다.")
        @Size(min = 1, max = 10, message = "질문은 최소 1개에서 최대 10개까지 입력할 수 있습니다.")
        @Valid List<CreateQuestionRequest> questions
) {
}
