package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.CoverLetter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    public static CompanyLibraryResponse of(List<CoverLetter> coverLetters, Map<Long, Long> countMap, boolean hasNext) {

        List<CoverLetterItem> items = coverLetters.stream()
                .map(coverLetter -> new CoverLetterItem(
                        coverLetter.getId(),
                        String.format("%d년 %s", coverLetter.getApplyYear(), coverLetter.getApplyHalf().getDescription()),
                        coverLetter.getCompanyName(),
                        coverLetter.getJobPosition(),
                        countMap.getOrDefault(coverLetter.getId(), 0L).intValue(),
                        coverLetter.getModifiedAt()
                ))
                .toList();

        return new CompanyLibraryResponse(items, hasNext);
    }
}