package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.QnA;
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
    public Integer countByCoverLetterId(Long coverLetterId) {
        return qnAJpaRepository.countByCoverLetterId(coverLetterId);
    }
}
