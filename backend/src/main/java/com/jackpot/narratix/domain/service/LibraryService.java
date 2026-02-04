package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.CompanyLibraryResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.LibraryType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.exception.CoverLetterErrorCode;
import com.jackpot.narratix.domain.exception.LibraryErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

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

    public CompanyLibraryResponse getCompanyLibraries(String userId, String companyName, int size, Long lastCoverLetterId) {

        Pageable pageable = PageRequest.of(0, size);

        Slice<CoverLetter> coverLetterSlice;

        if (lastCoverLetterId == null) {
            coverLetterSlice = coverLetterRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(userId, companyName, pageable);
        } else {
            CoverLetter lastCoverLetter = coverLetterRepository.findById(lastCoverLetterId)
                    .orElseThrow(() -> new BaseException(CoverLetterErrorCode.COVER_LETTER_NOT_FOUND));

            coverLetterSlice = coverLetterRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                    userId,
                    companyName,
                    LocalDate.from(lastCoverLetter.getModifiedAt()),
                    pageable
            );

        }

        List<CoverLetter> coverLetters = coverLetterSlice.getContent();
        boolean hasNext = coverLetterSlice.hasNext();

        return CompanyLibraryResponse.of(coverLetters, hasNext);
    }
}
