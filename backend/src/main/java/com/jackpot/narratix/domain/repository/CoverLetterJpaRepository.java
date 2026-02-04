package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CoverLetterJpaRepository extends JpaRepository<CoverLetter, Long> {

    Integer countByUserId(String userId);

    Integer countByUserIdAndApplyYearAndApplyHalf(String userId, int applyYear, ApplyHalfType applyHalf);

    @Query("SELECT DISTINCT c.companyName FROM CoverLetter c WHERE c.userId = :userId")
    List<String> findDistinctCompanyNamesByUserId(@Param("userId") String userId);

    @Query("SELECT c FROM CoverLetter c WHERE c.userId = :userId AND c.deadline >= :date ORDER BY c.deadline ASC LIMIT :limit")
    List<CoverLetter> findUpcomingCoverLettersByUserIdAndDate(@Param("userId") String userId, @Param("date") LocalDate date, @Param("limit") int limit);

    /**
     * ROW_NUMBER() 줄: 같은 deadline로 묶인 그룹 내부에서 modified_at을 내림차순으로 정렬
     * DENSE_RANK() 줄: 전체 자소서의 deadline을 오름차순으로 정렬 (반환되는 마감일 개수를 maxDeadLineSize 이하로 제한하기 위함)
     * sub 쿼리: 특정 유저의 자소서 중, 지나지 않은 deadline을 갖는 자기소개서 데이터만 1차로 추린다.
     * 메인 쿼리:
     *      1. 각 날짜별로 maxCoverLetterSizePerDeadLine만큼 남긴다.
     *      2. deadline이 빠른 순서대로 최대 maxDeadLineSize만큼 남긴다
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
}
