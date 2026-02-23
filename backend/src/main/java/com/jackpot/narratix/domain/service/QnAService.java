package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.repository.QnARepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QnAService {

    private final QnARepository qnARepository;

    @Transactional(readOnly = true)
    public QnA findByIdOrElseThrow(Long qnAId) {
        return qnARepository.findByIdOrElseThrow(qnAId);
    }

    @Transactional(readOnly = true)
    public Long getCoverLetterIdByQnAIdOrElseThrow(Long qnAId) {
        return qnARepository.getCoverLetterIdByQnAIdOrElseThrow(qnAId);
    }
}
