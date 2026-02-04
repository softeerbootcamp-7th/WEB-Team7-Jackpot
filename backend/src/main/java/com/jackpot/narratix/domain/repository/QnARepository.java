package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.repository.dto.QnACountProjection;

import java.util.List;

public interface QnARepository {

    void saveAll(List<QnA> qnAs);

    Integer countByUserId(String userId);

    List<QnACountProjection> countByCoverLetterIdIn(List<Long> coverLetterIds);
}
