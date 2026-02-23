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
     */
    @Transactional
    public void flushDeltasToDbAndSyncVersion(Long qnAId, List<TextUpdateRequest> deltas, long readCount) {
        if (deltas.isEmpty()) return;

        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        List<TextUpdateRequest> applicableDeltas = getApplicableDeltas(deltas, qnA.getVersion());

        String newAnswer = textMerger.merge(qnA.getAnswer(), applicableDeltas);
        qnA.editAnswer(newAnswer);
        long newVersion = qnARepository.incrementVersion(qnAId, applicableDeltas.size());

        // 정합성을 위해 DB 커밋과 Redis 커밋을 같은 트랜잭션 경계 내에서 실행한다.
        // pending을 committed로 이동하고 Redis 버전 카운터를 DB 버전으로 원자적으로 갱신한다.
        movePendingDeltasToCommitDeltas(qnAId, readCount, newVersion);
    }

    // getPending()으로 읽은 항목 수인 readCount를 commit()에 전달해 그 이후 유입된 델타를 보존한다.
    // DB 버전으로 Redis 버전 카운터를 원자적으로 덮어쓴다.
    private void movePendingDeltasToCommitDeltas(Long qnAId, long readCount, long newVersion) {
        long committedDeltaCount = textDeltaRedisRepository.commit(qnAId, readCount, newVersion);
        log.info("redis flush 완료: qnAId={}, committed 수={}, newVersion={}", qnAId, committedDeltaCount, newVersion);
    }

    /**
     * QnA answer를 업데이트하고 pending/committed delta를 모두 삭제한다.
     * Review 생성 시 사용되며, Reviewer를 위한 OT 히스토리가 더 이상 필요 없으므로 모두 정리한다.
     *
     * @param qnAId QnA ID
     * @param newAnswer 새로운 answer (이미 pending delta가 병합되고 마커가 추가된 상태)
     * @param pendingDeltaCount pending delta 개수 (version 증가량)
     * @return 새로운 version
     */
    @Transactional
    public long updateAnswerAndClearDeltas(Long qnAId, String newAnswer, long pendingDeltaCount) {
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        qnA.editAnswer(newAnswer);
        long newVersion = qnARepository.incrementVersion(qnAId, (int) pendingDeltaCount);

        textDeltaRedisRepository.clearDeltasAndSetVersion(qnAId, newVersion);
        return newVersion;
    }

    /**
     * QnA answer를 업데이트하고 pending을 committed로 이동하며 기존 committed는 모두 삭제한다.
     * Review 삭제/승인 시 사용되며, 기존 OT 히스토리를 정리하고 새로운 히스토리로 교체한다.
     *
     * @param qnAId QnA ID
     * @param newAnswer 새로운 answer
     * @param pendingDeltaCount pending delta 개수 (version 증가량)
     * @return 새로운 version
     */
    @Transactional
    public long updateAnswerCommitAndClearOldCommitted(Long qnAId, String newAnswer, long pendingDeltaCount) {
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        qnA.editAnswer(newAnswer);
        long newVersion = qnARepository.incrementVersion(qnAId, (int) pendingDeltaCount);

        // pending을 committed로 이동하고 기존 committed는 삭제 및 redis 버전 카운터 업데이트
        textDeltaRedisRepository.commitAndClearOldCommitted(qnAId, pendingDeltaCount, newVersion);

        return newVersion;
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
    public List<TextUpdateRequest> getApplicableDeltas(List<TextUpdateRequest> deltas, long dbVersion) {
        return deltas.stream()
                .filter(d -> d.version() > dbVersion)
                .toList();
    }

    public void setDbVersion(String shareId, List<Long> qnAIds) {

    }
}