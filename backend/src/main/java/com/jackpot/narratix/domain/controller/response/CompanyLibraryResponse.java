package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.CoverLetter;

import java.time.LocalDateTime;
import java.util.List;

public record CompanyLibraryResponse(
        List<CoverLetterItem> coverLetters,
        boolean hasNext
) {
    public record CoverLetterItem(
            Long id,
            String applySeason,
            String companyName,
            String jobPosition,
            int questionCount,
            LocalDateTime modifiedAt
    ) {
    }

    public static CompanyLibraryResponse of(List<CoverLetter> coverLetters, boolean hasNext) {
        List<CoverLetterItem> items = coverLetters.stream()
                .map(coverLetter -> new CoverLetterItem(
                        coverLetter.getId(),
                        String.format("%d년 %s",
                                coverLetter.getApplyYear(),
                                coverLetter.getApplyHalf().getDescription()),
                        coverLetter.getCompanyName(),
                        coverLetter.getJobPosition(),
                        coverLetter.getQuestionCount(),
                        coverLetter.getModifiedAt()
                ))
                .toList();

        return new CompanyLibraryResponse(items, hasNext);
    }
}