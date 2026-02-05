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
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Supplier;
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
    public CompanyLibraryResponse getCompanyLibraries(String userId, String companyName, int size, Optional<Long> lastCoverLetterId) {

        Pageable pageable = PageRequest.ofSize(size);

        Slice<CoverLetter> coverLetterSlice = getSliceByCursorId(
                lastCoverLetterId,
                coverLetterRepository::findByIdOrElseThrow,
                lastCoverLetter -> coverLetterRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(userId, companyName, lastCoverLetter.getModifiedAt(), pageable),
                () -> coverLetterRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(userId, companyName, pageable)

        );

        List<CoverLetter> coverLetters = coverLetterSlice.getContent();

        if (coverLetters.isEmpty()) {
            return CompanyLibraryResponse.of(Collections.emptyList(), Collections.emptyMap(), false);
        }

        Map<Long, Long> qnaCountMap = fetchQnaCountMap(coverLetters);
        boolean hasNext = coverLetterSlice.hasNext();

        return CompanyLibraryResponse.of(coverLetters, qnaCountMap, hasNext);
    }

    private <T> Slice<T> getSliceByCursorId(
            Optional<Long> lastId,
            Function<Long, T> findByIdOrElseThrow,
            Function<T, Slice<T>> findNextSlice,
            Supplier<Slice<T>> findFirstSlice
    ) {
        return lastId
                .map(id -> {
                    T lastEntity = findByIdOrElseThrow.apply(id);
                    return findNextSlice.apply(lastEntity);
                })
                .orElseGet(findFirstSlice);
    }

    private Map<Long, Long> fetchQnaCountMap(List<CoverLetter> coverLetters) {
        List<Long> ids = coverLetters.stream().map(CoverLetter::getId).toList();
        return qnARepository.countByCoverLetterIdIn(ids).stream()
                .collect(Collectors.toMap(
                        QnACountProjection::getCoverLetterId,
                        QnACountProjection::getCount
                ));
    }
}
