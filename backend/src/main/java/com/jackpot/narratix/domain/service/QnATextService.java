package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.event.TextReplaceAllEvent;
import com.jackpot.narratix.domain.repository.QnARepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * QnA 텍스트 업데이트를 담당하는 서비스.
 * answer 필드 수정 및 버전 관리를 처리한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QnATextService {

    private final QnARepository qnARepository;
    private final TextDeltaService textDeltaService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * QnA answer를 업데이트하고 TEXT_REPLACE_ALL 이벤트를 발행한다.
     * Redis 버전 업데이트는 afterCommit에서 수행하여 DB 커넥션 점유를 최소화한다.
     */
    @Transactional
    public void updateAnswerAndPublishEvent(Long qnAId, Long coverLetterId, String newAnswer) {
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        qnA.editAnswer(newAnswer);
        long newVersion = qnARepository.incrementVersion(qnAId, 1);

        // DB 커밋 후 Redis 업데이트 → 이벤트 발행 순서로 실행하여 DB 커넥션 점유 시간을 최소화
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    // 1. 먼저 Redis 버전 업데이트
                    textDeltaService.resetDeltaVersion(qnAId, newVersion);
                    // 2. Redis 업데이트 완료 후 이벤트 발행 (클라이언트가 이벤트를 받을 때 Redis가 이미 업데이트된 상태 보장)
                    eventPublisher.publishEvent(new TextReplaceAllEvent(coverLetterId, qnAId, newVersion, newAnswer));
                }
            });
        } else {
            // 트랜잭션이 없는 경우(테스트 환경) 직접 실행
            textDeltaService.resetDeltaVersion(qnAId, newVersion);
            eventPublisher.publishEvent(new TextReplaceAllEvent(coverLetterId, qnAId, newVersion, newAnswer));
        }
    }
}