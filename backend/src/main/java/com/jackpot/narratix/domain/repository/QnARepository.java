package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;

import java.util.List;

public interface QnARepository {

    void saveAll(List<QnA> qnAs);

    Integer countByUserId(String userId);

    List<QuestionCategoryType> findQuestionCategoryByUserId(String userId);
}
