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

    @Query("SELECT COUNT(s) > 0 FROM Scrap s WHERE s.id.userId = :userId AND s.id.qnAId = :qnAId")
    boolean existsById(
            @Param("userId") String userId,
            @Param("qnAId") Long qnAid
    );

    @Query(value = """
            SELECT q.*
            FROM scrap s
            JOIN qna q ON s.qna_id = q.id
            WHERE s.user_id = :userId
            AND MATCH(q.question, q.answer) AGAINST(:searchWord IN BOOLEAN MODE)
            ORDER BY s.created_at DESC, s.qna_id DESC
            """,
            nativeQuery = true)
    Slice<QnA> searchQnAInScraps(
            @Param("userId") String userId,
            @Param("searchWord") String searchWord,
            Pageable pageable
    );

    @Query(value = """
            SELECT q.*
            FROM scrap s
            JOIN qna q ON s.qna_id = q.id
            WHERE s.user_id = :userId
            AND MATCH(q.question, q.answer) AGAINST(:searchWord IN BOOLEAN MODE)
            AND (
                s.created_at < (SELECT s2.created_at FROM scrap s2 WHERE s2.user_id = :userId AND s2.qna_id = :lastQnaId)
                OR
                (
                    s.created_at = (SELECT s2.created_at FROM scrap s2 WHERE s2.user_id = :userId AND s2.qna_id = :lastQnaId)
                    AND s.qna_id < :lastQnaId
                )
            )
            ORDER BY s.created_at DESC, s.qna_id DESC
            """,
            nativeQuery = true)
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
