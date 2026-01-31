package com.jackpot.narratix.domain.controller.request;

import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class CreateCoverLetterRequest {

    private final String companyName;

    private final Integer applyYear;

    private final ApplyHalfType applyHalf;

    private final String jobPosition;

    private final LocalDate deadline;

    private final List<CreateQuestionRequest> questions;
}
