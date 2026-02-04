package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import java.time.LocalDate;

public interface CoverLetterJpaRepository extends JpaRepository<CoverLetter, Long> {

    Integer countByUserId(String userId);

    Integer countByUserIdAndApplyYearAndApplyHalf(String userId, int applyYear, ApplyHalfType applyHalf);

    @Query("SELECT DISTINCT c.companyName FROM CoverLetter c WHERE c.userId = :userId")
    List<String> findDistinctCompanyNamesByUserId(@Param("userId") String userId);

    List<CoverLetter> findByUserIdAndDeadlineBetweenOrderByDeadlineAscModifiedAtDesc(
            String userId, LocalDate startDate, LocalDate endDate, Pageable pageable
    );

    Integer countByUserIdAndDeadlineBetween(String userId, LocalDate startDate, LocalDate endDate);
}
