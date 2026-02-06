package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.repository.dto.QnACountProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QnAJpaRepository extends JpaRepository<QnA, Long> {

    Integer countByUserId(String userId);

    @Query("SELECT DISTINCT q.questionCategory FROM QnA q WHERE q.userId = :userId")
    List<QuestionCategoryType> findDistinctByQuestionCategory(@Param("userId") String userId);

    @Query("SELECT qna.coverLetter.id as coverLetterId, COUNT(qna) as count " +
            "FROM QnA qna " +
            "WHERE qna.coverLetter.id IN :coverLetterIds " +
            "GROUP BY qna.coverLetter.id")
    List<QnACountProjection> countByCoverLetterIdIn(@Param("coverLetterIds") List<Long> coverLetterIds);

    @Query("SELECT q FROM QnA q " +
            "WHERE q.userId = :userId " +
            "AND q.questionCategory = :category " +
            "AND q.modifiedAt < :lastModifiedAt " +
            "ORDER BY q.modifiedAt DESC")
    Slice<QnA> findNextPageByQuestionCategory(
            @Param("userId") String userId,
            @Param("category") QuestionCategoryType category,
            @Param("lastModifiedAt") LocalDateTime lastModifiedAt,
            Pageable pageable
    );

    Slice<QnA> findByUserIdAndQuestionCategoryOrderByModifiedAtDesc(
            @Param("userId") String userId,
            @Param("category") QuestionCategoryType category,
            Pageable pageable
    );
}
