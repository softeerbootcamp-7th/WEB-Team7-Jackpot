package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.QnA;

import java.util.List;

public interface QnARepository {

    void saveAll(List<QnA> qnAs);

    Integer countByUserId(String userId);

    Integer countByCoverLetterId(Long coverLetterId);
}
