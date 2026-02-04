package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.exception.CoverLetterErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
}
