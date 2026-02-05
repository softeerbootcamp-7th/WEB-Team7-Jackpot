package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.CoverLetter;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record UpcomingCoverLetterResponse(
        LocalDate deadline,
        List<UpcomingCoverLetter> coverLetters
) {

    public static UpcomingCoverLetterResponse of(Map.Entry<LocalDate, List<CoverLetter>> groupedCoverLetters) {
        LocalDate deadline = groupedCoverLetters.getKey();
        List<UpcomingCoverLetter> upcomingCoverLetters = groupedCoverLetters.getValue().stream()
                .map(UpcomingCoverLetter::of)
                .toList();

        return new UpcomingCoverLetterResponse(
                deadline,
                upcomingCoverLetters
        );
    }

    public record UpcomingCoverLetter(
            Long coverLetterId,
            String companyName,
            String jobPosition
    ) {
        public static UpcomingCoverLetter of(CoverLetter coverLetter) {
            return new UpcomingCoverLetter(
                    coverLetter.getId(),
                    coverLetter.getCompanyName(),
                    coverLetter.getJobPosition()
            );
        }
    }
}
