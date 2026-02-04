package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.exception.CoverLetterErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.groupingBy;

@Repository
@RequiredArgsConstructor
public class CoverLetterRepositoryImpl implements CoverLetterRepository {

    private final CoverLetterJpaRepository coverLetterJpaRepository;

    @Override
    public CoverLetter save(CoverLetter coverLetter) {
        return coverLetterJpaRepository.save(coverLetter);
    }

    @Override
    public Optional<CoverLetter> findById(Long coverLetterId) {
        return coverLetterJpaRepository.findById(coverLetterId);
    }

    @Override
    public void deleteById(Long coverLetterId) {
        coverLetterJpaRepository.deleteById(coverLetterId);
    }

    @Override
    public CoverLetter findByIdOrElseThrow(Long coverLetterId) {
        return coverLetterJpaRepository.findById(coverLetterId)
                .orElseThrow(() -> new BaseException(CoverLetterErrorCode.COVER_LETTER_NOT_FOUND));
    }

    @Override
    public Integer countByUserId(String userId) {
        return coverLetterJpaRepository.countByUserId(userId);
    }

    @Override
    public Integer countByUserIdAndApplyYearAndApplyHalf(String userId, int applyYear, ApplyHalfType applyHalfType) {
        return coverLetterJpaRepository.countByUserIdAndApplyYearAndApplyHalf(userId, applyYear, applyHalfType);
    }

    @Override
    public List<String> findCompanyNamesByUserId(String userId) {
        return coverLetterJpaRepository.findDistinctCompanyNamesByUserId(userId);
    }

    @Override
    public Map<LocalDate, List<CoverLetter>> findUpcomingCoverLettersGroupedByDeadline(
            String userId, LocalDate date, int maxDeadLineSize, int maxCoverLetterSizePerDeadLine
    ) {
        List<CoverLetter> coverLetters = coverLetterJpaRepository
                .findUpcomingCoverLettersGroupedByDeadline(userId, date, maxDeadLineSize, maxCoverLetterSizePerDeadLine);

        return coverLetters.stream()
                .collect(groupingBy(
                        CoverLetter::getDeadline, LinkedHashMap::new, Collectors.toList()
                ));
    }
}
