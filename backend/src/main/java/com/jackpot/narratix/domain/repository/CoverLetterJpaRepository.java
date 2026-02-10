package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    /**
     * ROW_NUMBER() 줄: 같은 deadline로 묶인 그룹 내부에서 modified_at을 내림차순으로 정렬
     * DENSE_RANK() 줄: 전체 자소서의 deadline을 오름차순으로 정렬 (반환되는 마감일 개수를 maxDeadLineSize 이하로 제한하기 위함)
     * sub 쿼리: 특정 유저의 자소서 중, 지나지 않은 deadline을 갖는 자기소개서 데이터만 1차로 추린다.
     * 메인 쿼리:
     * 1. 각 날짜별로 maxCoverLetterSizePerDeadLine만큼 남긴다.
     * 2. deadline이 빠른 순서대로 최대 maxDeadLineSize만큼 남긴다
     */
    @Query(value = """
                    SELECT * FROM (
                        SELECT c.*,
                        ROW_NUMBER() OVER (PARTITION BY c.deadline ORDER BY c.modified_at DESC) as row_num,
                        DENSE_RANK() OVER (ORDER BY c.deadline ASC) as deadline_rank
                          FROM coverletter c
                          WHERE c.user_id = :userId AND c.deadline >= :date
                        ) sub
                        WHERE sub.row_num <= :maxCoverLetterSizePerDeadLine AND sub.deadline_rank <= :maxDeadLineSize
                        ORDER BY sub.deadline ASC, sub.modified_at DESC
            """, nativeQuery = true)
    List<CoverLetter> findUpcomingCoverLettersGroupedByDeadline(
            @Param("userId") String userId,
            @Param("date") LocalDate date,
            @Param("maxDeadLineSize") int maxDeadLineSize,
            @Param("maxCoverLetterSizePerDeadLine") int maxCoverLetterSizePerDeadLine
    );

    @Query("SELECT c FROM CoverLetter c LEFT JOIN FETCH c.qnAs WHERE c.id = :id")
    Optional<CoverLetter> findByIdWithQnAs(@Param("id") Long coverLetterId);

    @Query("SELECT DISTINCT c.deadline FROM CoverLetter c " +
            "WHERE c.userId = :userId " +
            "AND c.deadline >= :startDate " +
            "AND c.deadline <= :endDate " +
            "ORDER BY c.deadline ASC")
    List<LocalDate> findDeadlineByUserIdBetweenDeadline(
            @Param("userId") String userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );


    @Query("""
                SELECT c FROM CoverLetter c
                WHERE c.userId = :userId
                  AND (
                       :keyword IS NULL OR :keyword = ''
                       OR c.companyName LIKE concat('%', :keyword, '%')
                       OR c.jobPosition LIKE concat('%', :keyword, '%')
                  )
                ORDER BY c.modifiedAt DESC
            """)
    Page<CoverLetter> searchCoverLetters(
            @Param("userId") String userId,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
