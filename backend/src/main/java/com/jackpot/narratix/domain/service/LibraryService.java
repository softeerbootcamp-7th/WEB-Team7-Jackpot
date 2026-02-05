package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.CompanyLibraryResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.LibraryType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.exception.LibraryErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.dto.QnACountProjection;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final CoverLetterRepository coverLetterRepository;
    private final QnARepository qnARepository;

    public List<String> getLibraryList(String userId, LibraryType libraryType) {
        return switch (libraryType) {
            case COMPANY -> getCompanyName(userId);
            case QUESTION -> getQuestionCategory(userId);
            default -> throw new BaseException(LibraryErrorCode.INVALID_LIBRARY_TYPE);
        };
    }

    private List<String> getCompanyName(String userId) {
        return coverLetterRepository.findCompanyNamesByUserId(userId);
    }

    private List<String> getQuestionCategory(String userId) {
        return qnARepository.findQuestionCategoryByUserId(userId).stream()
                .map(QuestionCategoryType::getDescription)
                .toList();
    }

    @Transactional(readOnly = true)
    public CompanyLibraryResponse getCompanyLibraries(String userId, String companyName, int size, Long lastCoverLetterId) {

        Pageable pageable = PageRequest.ofSize(size);

        Slice<CoverLetter> coverLetterSlice;

        if (lastCoverLetterId == null) {
            coverLetterSlice = coverLetterRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(userId, companyName, pageable);
        } else {
            CoverLetter lastCoverLetter = coverLetterRepository.findByIdOrElseThrow(lastCoverLetterId);

            coverLetterSlice = coverLetterRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                    userId,
                    companyName,
                    lastCoverLetter.getModifiedAt(),
                    pageable
            );

        }

        List<CoverLetter> coverLetters = coverLetterSlice.getContent();

        List<Long> coverLetterIds = coverLetters.stream()
                .map(CoverLetter::getId)
                .toList();

        if (coverLetterIds.isEmpty()) {
            return CompanyLibraryResponse.of(
                    Collections.EMPTY_LIST,
                    Collections.EMPTY_MAP,
                    false
            );
        }

        List<QnACountProjection> counts = qnARepository.countByCoverLetterIdIn(coverLetterIds);

        Map<Long, Long> qnaCountMap = counts.stream()
                .collect(Collectors.toMap(
                        QnACountProjection::getCoverLetterId,
                        QnACountProjection::getCount
                ));

        boolean hasNext = coverLetterSlice.hasNext();

        return CompanyLibraryResponse.of(
                coverLetters,
                qnaCountMap,
                hasNext
        );
    }
}
