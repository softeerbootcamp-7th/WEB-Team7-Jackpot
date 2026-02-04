package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;

import java.time.LocalDate;
import java.util.List;

public record CoverLettersDateRangeResponse(
    Integer totalCount,
    List<CoverLetterResponse> coverLetters
) {

    public static CoverLettersDateRangeResponse of(
            Integer totalCoverLetterSize, List<CoverLetterResponse> coverLetters
    ){
        return new CoverLettersDateRangeResponse(totalCoverLetterSize, coverLetters);
    }

    public record CoverLetterResponse(
            Long coverLetterId,
            String companyName,
            Integer applyYear,
            ApplyHalfType applyHalf,
            String jobPosition,
            LocalDate deadline,
            Integer questionCount
    ) {

        public static CoverLetterResponse of(CoverLetter coverLetter, Integer questionCount){
            return new CoverLetterResponse(
                    coverLetter.getId(),
                    coverLetter.getCompanyName(),
                    coverLetter.getApplyYear(),
                    coverLetter.getApplyHalf(),
                    coverLetter.getJobPosition(),
                    coverLetter.getDeadline(),
                    questionCount
            );
        }
    }
}
