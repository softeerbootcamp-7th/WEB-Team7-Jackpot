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
import org.springframework.transaction.annotation.Propagation;
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
     * pending 델타를 즉시 DB에 flush한다.
     * 리뷰 생성 등 최신 DBText가 필요한 경우 직접 호출된다.
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED) // Redis 조회를 트랜잭션 밖에서 수행하여 DB 커넥션 점유 시간을 최소화하기 위함
    public void flushToDb(Long qnAId) {
        List<TextUpdateRequest> deltas = textDeltaRedisRepository.getPending(qnAId);
        if (deltas.isEmpty()) {
            log.debug("flush 대상 pending 델타 없음: qnAId={}", qnAId);
            return;
        }

        long readCount = deltas.size();
        flushToDbInternal(qnAId, deltas, readCount);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void flushToDbInternal(Long qnAId, List<TextUpdateRequest> deltas, long readCount) {
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        List<TextUpdateRequest> applicableDeltas = getApplicableDeltas(deltas, qnA.getVersion());

        // getPending()으로 읽은 항목 수를 commit()에 전달해 그 이후 유입된 델타를 보존한다.
        String newAnswer = textMerger.merge(qnA.getAnswer(), applicableDeltas);
        qnA.editAnswer(newAnswer);
        qnARepository.incrementVersion(qnAId, applicableDeltas.size());

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                commitSilently(qnAId, readCount);
            }
        });
    }

    private void commitSilently(Long qnAId, long readCount) {
        try {
            long committedDeltaCount = textDeltaRedisRepository.commit(qnAId, readCount);
            log.info("DB flush 완료: qnAId={}, committed 수={}", qnAId, committedDeltaCount);
        } catch (Exception e) {
            log.error("Redis commit 실패 (DB는 이미 커밋됨), pending 강제 삭제 시도: qnAId={}", qnAId, e);
            clearPendingSilently(qnAId);
        }
    }

    private void clearPendingSilently(Long qnAId) {
        try {
            textDeltaRedisRepository.clearPending(qnAId);
        } catch (Exception e) {
            log.error("pending 강제 삭제 실패 (다음 flush에서 버전 필터링으로 재처리됨): qnAId={}", qnAId, e);
        }
    }

    /**
     * saveAndMaybeFlush에서 버전 충돌 발생 시 Writer와 Reviewer의 텍스트 상태를 동기화하기 위한 메시지를 반환한다.
     *
     * <p>버전 충돌은 Lua 스크립트에서 push가 발생하기 전에 감지되므로 Redis 롤백이 필요 없다.
     * DB 텍스트와 현재 pending 델타를 병합한 결과를 담은 TEXT_REPLACE_ALL 메시지를 반환한다.</p>
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public WebSocketMessageResponse recoverTextReplaceAll(Long qnAId) {
        List<TextUpdateRequest> deltas;
        try {
            deltas = textDeltaRedisRepository.getPending(qnAId);
        } catch (Exception e) {
            log.error("pending 델타 조회 실패, DB 텍스트로 대체: qnAId={}", qnAId, e);
            deltas = Collections.emptyList();
        }
        return buildTextReplaceAllResponse(qnAId, deltas);
    }

    /**
     * saveAndMaybeFlush에서 push 이후 실제 오류(예: flushToDb 실패) 발생 시 텍스트 상태를 동기화하기 위한 메시지를 반환한다.
     *
     * <p>push가 완료된 마지막 델타를 Redis에서 롤백한 뒤
     * DB 텍스트와 나머지 pending 델타를 병합한 결과를 담은 TEXT_REPLACE_ALL 메시지를 반환한다.</p>
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public WebSocketMessageResponse recoverTextReplaceAllWithRollback(Long qnAId) {
        try {
            textDeltaRedisRepository.rollbackLastPush(qnAId);
        } catch (Exception e) {
            log.error("rollbackLastPush 실패: qnAId={}", qnAId, e);
        }

        List<TextUpdateRequest> deltas;
        try {
            deltas = textDeltaRedisRepository.getPending(qnAId);
        } catch (Exception e) {
            log.error("pending 델타 조회 실패, DB 텍스트로 대체: qnAId={}", qnAId, e);
            deltas = Collections.emptyList();
        }
        return buildTextReplaceAllResponse(qnAId, deltas);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected WebSocketMessageResponse buildTextReplaceAllResponse(Long qnAId, List<TextUpdateRequest> deltas) {
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