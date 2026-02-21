package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.CoverLetter;

import java.util.List;

public record CoverLetterAndQnAIdsResponse(
        CoverLetterResponse coverLetter,
        List<Long> qnAIds
) {

    public static CoverLetterAndQnAIdsResponse of(CoverLetter coverLetter, List<Long> qnAIds) {
        return new CoverLetterAndQnAIdsResponse(CoverLetterResponse.of(coverLetter), qnAIds);
    }

    public record CoverLetterResponse(
            Long coverLetterId,
            String companyName,
            String jobPosition
    ) {
        private static CoverLetterResponse of(CoverLetter coverLetter) {
            return new CoverLetterResponse(
                    coverLetter.getId(),
                    coverLetter.getCompanyName(),
                    coverLetter.getJobPosition()
            );
        }
    }
}
