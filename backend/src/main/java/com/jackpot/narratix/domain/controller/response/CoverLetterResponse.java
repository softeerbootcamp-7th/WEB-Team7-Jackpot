package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;

import java.time.LocalDate;

public record CoverLetterResponse(
    Long coverLetterId,
    String companyName,
    Integer applyYear,
    ApplyHalfType applyHalf,
    String jobPosition,
    LocalDate deadline
) {

    public static CoverLetterResponse of(CoverLetter coverLetter){
        return new CoverLetterResponse(
            coverLetter.getId(),
            coverLetter.getCompanyName(),
            coverLetter.getApplyYear(),
            coverLetter.getApplyHalf(),
            coverLetter.getJobPosition(),
            coverLetter.getDeadline()
        );
    }
}
