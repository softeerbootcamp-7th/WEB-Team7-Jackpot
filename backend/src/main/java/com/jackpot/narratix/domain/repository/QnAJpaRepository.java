package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.repository.dto.QnACountProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QnAJpaRepository extends JpaRepository<QnA, Long> {

    Integer countByUserId(String userId);

    @Query("SELECT qna.coverLetter.id as coverLetterId, COUNT(qna) as count " +
            "FROM QnA qna " +
            "WHERE qna.coverLetter.id IN :coverLetterIds " +
            "GROUP BY qna.coverLetter.id")
    List<QnACountProjection> countByCoverLetterIdIn(List<Long> coverLetterIds);
}
