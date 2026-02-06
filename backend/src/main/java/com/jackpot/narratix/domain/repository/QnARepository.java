package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.repository.dto.QnACountProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import java.time.LocalDateTime;
import java.util.List;

public interface QnARepository {

    Integer countByUserId(String userId);

    List<QnACountProjection> countByCoverLetterIdIn(List<Long> coverLetterIds);

    List<QuestionCategoryType> findQuestionCategoryByUserId(String userId);

    Slice<QnA> findByUserIdAndQuestionCategoryTypeOrderByModifiedAtDesc(String userId,
                                                                        QuestionCategoryType category,
                                                                        LocalDateTime localDateTime,
                                                                        Pageable pageable);

    Slice<QnA> findByUserIdAndQuestionCategoryTypeOrderByModifiedAtDesc(String userId,
                                                                        QuestionCategoryType category,
                                                                        Pageable pageable);

    QnA findByIdOrElseThrow(Long qnaId);
}
