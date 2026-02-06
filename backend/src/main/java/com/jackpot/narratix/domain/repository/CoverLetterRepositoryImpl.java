package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.exception.CoverLetterErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
    public List<CoverLetter> findInPeriod(
            String userId, LocalDate startDate, LocalDate endDate, Pageable pageable
    ) {
        return coverLetterJpaRepository.findByUserIdAndDeadlineBetweenOrderByDeadlineAscModifiedAtDesc(
                userId, startDate, endDate, pageable
        );
    }

    @Override
    public Long countByUserIdAndDeadlineBetween(String userId, LocalDate startDate, LocalDate endDate) {
        return coverLetterJpaRepository.countByUserIdAndDeadlineBetween(userId, startDate, endDate);
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
    public Slice<CoverLetter> findByUserIdAndCompanyNameOrderByModifiedAtDesc(String userId, String companyName, Pageable pageable) {
        return coverLetterJpaRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                userId,
                companyName,
                pageable
        );
    }

    @Override
    public Slice<CoverLetter> findByUserIdAndCompanyNameOrderByModifiedAtDesc(String userId, String companyName, LocalDateTime localDate, Pageable pageable) {
        return coverLetterJpaRepository.findNextPageByCompany(
                userId,
                companyName,
                localDate,
                pageable
        );
    }

    @Override
    public CoverLetter findByIdWithQnAsOrElseThrow(Long coverLetterId) {
        return coverLetterJpaRepository.findByIdWithQnAs(coverLetterId)
                .orElseThrow(() -> new BaseException(CoverLetterErrorCode.COVER_LETTER_NOT_FOUND));
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
