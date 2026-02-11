package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Scrap;
import com.jackpot.narratix.domain.entity.ScrapId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ScrapJpaRepository extends JpaRepository<Scrap, ScrapId> {

    @Query("SELECT COUNT(s) FROM Scrap s WHERE s.id.userId = :userId")
    Long countByUserId(String userId);

    boolean existsById(ScrapId scrapId);

    @Query("""
            SELECT q
            FROM Scrap s
            JOIN QnA q ON s.id.qnAId = q.id
            JOIN FETCH q.coverLetter
            WHERE s.id.userId = :userId
            AND (
               q.question LIKE CONCAT('%', :searchWord, '%') OR
               q.answer LIKE CONCAT('%', :searchWord, '%')
            )
            ORDER BY s.createdAt DESC, s.id.qnAId DESC
            """)
    Slice<QnA> searchQnAInScraps(
            @Param("userId") String userId,
            @Param("searchWord") String searchWord,
            Pageable pageable
    );

    @Query("""
            SELECT q
            FROM Scrap s
            JOIN QnA q ON s.id.qnAId = q.id
            JOIN FETCH q.coverLetter
            WHERE s.id.userId = :userId
            AND (
               q.question LIKE CONCAT('%', :searchWord, '%') OR
               q.answer LIKE CONCAT('%', :searchWord, '%')
            )
            AND (
                s.createdAt < (SELECT s2.createdAt FROM Scrap s2 WHERE s2.id.userId = :userId AND s2.id.qnAId = :lastQnaId)
                OR
                (
                    s.createdAt = (SELECT s2.createdAt FROM Scrap s2 WHERE s2.id.userId = :userId AND s2.id.qnAId = :lastQnaId)
                    AND s.id.qnAId < :lastQnaId
                )
            )
            ORDER BY s.createdAt DESC, s.id.qnAId DESC
            """)
    Slice<QnA> searchQnAInScrapsNext(
            @Param("userId") String userId,
            @Param("searchWord") String searchWord,
            @Param("lastQnaId") Long lastQnaId,
            Pageable pageable
    );

    @Query("""
                SELECT q
                FROM Scrap s
                JOIN QnA q ON s.id.qnAId = q.id
                JOIN FETCH q.coverLetter
                WHERE s.id.userId = :userId
                ORDER BY s.createdAt DESC, s.id.qnAId DESC
            """)
    Slice<QnA> findScraps(
            @Param("userId") String userId,
            Pageable pageable
    );

    @Query("""
                SELECT q
                FROM Scrap s
                JOIN QnA q ON s.id.qnAId = q.id
                JOIN FETCH q.coverLetter
                WHERE s.id.userId = :userId
                AND (
                    s.createdAt < (SELECT s2.createdAt FROM Scrap s2
                                   WHERE s2.id.userId = :userId AND s2.id.qnAId = :lastQnaId)
                    OR
                    (
                        s.createdAt = (SELECT s2.createdAt FROM Scrap s2
                                       WHERE s2.id.userId = :userId AND s2.id.qnAId = :lastQnaId)
                        AND s.id.qnAId < :lastQnaId
                    )
                )
                ORDER BY s.createdAt DESC, s.id.qnAId DESC
            """)
    Slice<QnA> findScrapsNext(
            @Param("userId") String userId,
            @Param("lastQnaId") Long lastQnaId,
            Pageable pageable
    );

}
