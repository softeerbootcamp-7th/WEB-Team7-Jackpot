package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.repository.dto.QnACountProjection;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class QnARepositoryImpl implements QnARepository {

    private final QnAJpaRepository qnAJpaRepository;

    @Override
    public Integer countByUserId(String userId) {
        return qnAJpaRepository.countByUserId(userId);
    }

    @Override
    public List<QnACountProjection> countByCoverLetterIdIn(List<Long> coverLetterIds) {
        return qnAJpaRepository.countByCoverLetterIdIn(coverLetterIds);
    }

    @Override
    public List<QuestionCategoryType> findQuestionCategoryByUserId(String userId) {
        return qnAJpaRepository.findDistinctByQuestionCategory(userId);
    }
}
