package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;

import java.time.LocalDate;
import java.util.List;

public record FilteredCoverLettersResponse(
    Long totalCount,
    List<CoverLetterResponse> coverLetters,
    boolean hasNext
) {

    public static FilteredCoverLettersResponse of(
            Long totalCoverLetterSize, List<CoverLetterResponse> coverLetters, boolean hasNext
    ){
        return new FilteredCoverLettersResponse(totalCoverLetterSize, coverLetters, hasNext);
    }

    public record CoverLetterResponse(
            Long coverLetterId,
            String companyName,
            Integer applyYear,
            ApplyHalfType applyHalf,
            String jobPosition,
            LocalDate deadline,
            Long questionCount
    ) {

        public static CoverLetterResponse of(CoverLetter coverLetter, Long questionCount){
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
