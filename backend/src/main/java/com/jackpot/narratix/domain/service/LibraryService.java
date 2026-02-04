package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.enums.LibraryType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.exception.LibraryErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
