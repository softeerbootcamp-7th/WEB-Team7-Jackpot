package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface CoverLetterRepository {

    CoverLetter save(CoverLetter coverLetter);

    Integer countByUserId(String userId);

    Integer countByUserIdAndApplyYearAndApplyHalf(String userId, int applyYear, ApplyHalfType applyHalf);

    Optional<CoverLetter> findById(Long coverLetterId);

    void deleteById(Long coverLetterId);

    List<CoverLetter> findInPeriod(
            String userId, LocalDate startDate, LocalDate endDate, Pageable pageable
    );

    Long countByUserIdAndDeadlineBetween(String userId, LocalDate startDate, LocalDate endDate);

    CoverLetter findByIdOrElseThrow(Long coverLetterId);

    List<String> findCompanyNamesByUserId(String userId);

    Map<LocalDate, List<CoverLetter>> findUpcomingCoverLettersGroupedByDeadline(
            String userId, LocalDate date, int maxDeadLineSize, int maxCoverLetterSizePerDeadLine
    );

    Slice<CoverLetter> findByUserIdAndCompanyNameOrderByModifiedAtDesc(String userId, String companyName, Pageable pageable);

    Slice<CoverLetter> findByUserIdAndCompanyNameOrderByModifiedAtDesc(String userId, String companyName, LocalDateTime localDate, Pageable pageable);

}
