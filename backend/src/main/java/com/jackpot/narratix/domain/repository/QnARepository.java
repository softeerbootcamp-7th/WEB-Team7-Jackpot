package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.repository.dto.QnACountProjection;

import java.util.List;

public interface QnARepository {

    Integer countByUserId(String userId);

    List<QnACountProjection> countByCoverLetterIdIn(List<Long> coverLetterIds);

    List<QuestionCategoryType> findQuestionCategoryByUserId(String userId);
}
