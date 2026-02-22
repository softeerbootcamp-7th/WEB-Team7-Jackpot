package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.WebSocketMessageType;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.TextDeltaRedisRepository;
import com.jackpot.narratix.domain.service.dto.WebSocketTextReplaceAllMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Collections;
import java.util.List;

/**
 * Redis pending 델타를 DB로 동기화하는 서비스.
 * DB 트랜잭션 관리와 Redis ↔ DB 간 데이터 동기화를 담당한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TextSyncService {

    private final TextDeltaRedisRepository textDeltaRedisRepository;
    private final QnARepository qnARepository;
    private final TextMerger textMerger;

    /**
     * pending 델타를 Redis에서 조회한다.
     * 리뷰 생성 등 최신 DBText가 필요한 경우 flushToDbInternal과 함께 호출된다.
     *
     * @return pending 델타 리스트 (비어있을 수 있음)
     */
    public List<TextUpdateRequest> getPendingDeltas(Long qnAId) {
        try {
            return textDeltaRedisRepository.getPending(qnAId);
        } catch (Exception e) {
            log.error("pending 델타 조회 실패: qnAId={}", qnAId, e);
            return Collections.emptyList();
        }
    }

    /**
     * pending 델타를 DB에 flush한다.
     * flushToDb로 조회한 델타를 DB에 적용한다.
     */
    @Transactional
    public void flushDeltasToDb(Long qnAId, List<TextUpdateRequest> deltas, long readCount) {
        if (deltas.isEmpty()) return;
        else {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    movePendingDeltasToCommitDeltas(qnAId, readCount);
                }
            });
        }

        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        List<TextUpdateRequest> applicableDeltas = getApplicableDeltas(deltas, qnA.getVersion());

        // getPending()으로 읽은 항목 수를 commit()에 전달해 그 이후 유입된 델타를 보존한다.
        String newAnswer = textMerger.merge(qnA.getAnswer(), applicableDeltas);
        qnA.editAnswer(newAnswer);
        qnARepository.incrementVersion(qnAId, applicableDeltas.size());
    }

    private void movePendingDeltasToCommitDeltas(Long qnAId, long readCount) {
        try {
            long committedDeltaCount = textDeltaRedisRepository.commit(qnAId, readCount);
            log.info("redis flush 완료: qnAId={}, committed 수={}", qnAId, committedDeltaCount);
        } catch (Exception e) {
            log.error("Redis commit 실패 (DB는 이미 커밋됨), pending 강제 삭제 시도: qnAId={}", qnAId, e);
            clearPending(qnAId);
        }
    }

    private void clearPending(Long qnAId) {
        try {
            textDeltaRedisRepository.clearPending(qnAId);
        } catch (Exception e) {
            log.error("pending 강제 삭제 실패 (다음 flush에서 버전 필터링으로 재처리됨): qnAId={}", qnAId, e);
        }
    }

    /**
     * saveAndMaybeFlush에서 push 이후 실패 발생 시 마지막 push를 롤백하고 pending 델타를 조회한다.
     *
     * <p>push가 완료된 마지막 델타를 Redis에서 롤백한 뒤 나머지 pending 델타를 조회한다.
     * 조회한 델타는 buildTextReplaceAllResponse와 함께 사용하여 TEXT_REPLACE_ALL 메시지를 생성한다.</p>
     *
     * @return pending 델타 리스트 (조회 실패 시 빈 리스트)
     */
    public List<TextUpdateRequest> recoverFlushedDeltas(Long qnAId) {
        try {
            textDeltaRedisRepository.rollbackLastPush(qnAId);
        } catch (Exception e) {
            log.error("rollbackLastPush 실패: qnAId={}", qnAId, e);
        }

        try {
            return textDeltaRedisRepository.getPending(qnAId);
        } catch (Exception e) {
            log.error("pending 델타 조회 실패, DB 텍스트로 대체: qnAId={}", qnAId, e);
            return Collections.emptyList();
        }
    }

    @Transactional
    public WebSocketMessageResponse buildTextReplaceAllResponse(Long qnAId, List<TextUpdateRequest> deltas) {
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        List<TextUpdateRequest> applicableDeltas = getApplicableDeltas(deltas, qnA.getVersion());

        String newAnswer = textMerger.merge(qnA.getAnswer(), applicableDeltas);
        qnA.editAnswer(newAnswer);
        long version = qnARepository.incrementVersion(qnAId, applicableDeltas.size());

        log.info("TEXT_REPLACE_ALL 메시지 생성: qnAId={}, version={}", qnAId, version);
        WebSocketTextReplaceAllMessage message = new WebSocketTextReplaceAllMessage(version, newAnswer);
        return new WebSocketMessageResponse(WebSocketMessageType.TEXT_REPLACE_ALL, qnAId, message);
    }

    /**
     * delta.version()은 클라이언트가 보낸 다음 버전(push 후 Redis 버전)이므로,
     * delta.version() <= dbVersion인 것은 이미 DB에 반영됨
     */
    private List<TextUpdateRequest> getApplicableDeltas(List<TextUpdateRequest> deltas, long dbVersion) {
        return deltas.stream()
                .filter(d -> d.version() > dbVersion)
                .toList();
    }
}