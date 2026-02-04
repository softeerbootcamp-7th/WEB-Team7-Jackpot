package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class QnARepositoryImpl implements QnARepository {

    private final QnAJpaRepository qnAJpaRepository;

    @Override
    public void saveAll(List<QnA> qnAs) {
        qnAJpaRepository.saveAll(qnAs);
    }

    @Override
    public Integer countByUserId(String userId) {
        return qnAJpaRepository.countByUserId(userId);
    }

    @Override
    public List<QuestionCategoryType> findQuestionCategoryByUserId(String userId) {
        return qnAJpaRepository.findDistinctByQuestionCategory(userId);
    }

    @Override
    public List<QnACountProjection> countByCoverLetterIdIn(List<Long> coverLetterIds) {
        if (coverLetterIds == null || coverLetterIds.isEmpty()) {
            return List.of();
        }
        return qnAJpaRepository.countByCoverLetterIdIn(coverLetterIds);
    }
}
