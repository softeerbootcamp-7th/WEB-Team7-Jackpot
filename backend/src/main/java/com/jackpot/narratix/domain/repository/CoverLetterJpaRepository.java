package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface CoverLetterJpaRepository extends JpaRepository<CoverLetter, Long> {

    Integer countByUserId(String userId);

    Integer countByUserIdAndApplyYearAndApplyHalf(String userId, int applyYear, ApplyHalfType applyHalf);

    @Query("SELECT DISTINCT c.companyName FROM CoverLetter c WHERE c.userId = :userId")
    List<String> findDistinctCompanyNamesByUserId(@Param("userId") String userId);

    Slice<CoverLetter> findByUserIdAndCompanyNameOrderByModifiedAtDesc(
            @Param("userId") String userId,
            @Param("companyName") String companyName,
            Pageable pageable
    );

    @Query("SELECT c FROM CoverLetter c " +
            "WHERE c.userId = :userId " +
            "AND c.companyName = :companyName " +
            "AND c.modifiedAt < :lastModifiedAt " +
            "ORDER BY c.modifiedAt DESC")
    Slice<CoverLetter> findNextPageByCompany(
            @Param("userId") String userId,
            @Param("companyName") String companyName,
            @Param("lastModifiedAt") LocalDateTime lastModifiedAt,
            Pageable pageable
    );

    List<CoverLetter> findByUserIdAndDeadlineBetweenOrderByDeadlineAscModifiedAtDesc(
            String userId, LocalDate startDate, LocalDate endDate, Pageable pageable
    );

    Long countByUserIdAndDeadlineBetween(String userId, LocalDate startDate, LocalDate endDate);
}
