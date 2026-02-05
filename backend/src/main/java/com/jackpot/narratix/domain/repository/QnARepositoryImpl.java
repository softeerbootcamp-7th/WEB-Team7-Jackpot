package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.exception.QnAErrorCode;
import com.jackpot.narratix.domain.repository.dto.QnACountProjection;
import com.jackpot.narratix.global.exception.BaseException;
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
    public List<QuestionCategoryType> findQuestionCategoryByUserId(String userId) {
        return qnAJpaRepository.findDistinctByQuestionCategory(userId);
    }

    @Override
    public QnA findByIdOrElseThrow(Long qnaId) {
        return qnAJpaRepository.findById(qnaId)
                .orElseThrow(() -> new BaseException(QnAErrorCode.QNA_NOT_FOUND));
    }

    @Override
    public List<QnACountProjection> countByCoverLetterIdIn(List<Long> coverLetterIds) {
        if (coverLetterIds == null || coverLetterIds.isEmpty()) {
            return List.of();
        }
        return qnAJpaRepository.countByCoverLetterIdIn(coverLetterIds);
    }
}
