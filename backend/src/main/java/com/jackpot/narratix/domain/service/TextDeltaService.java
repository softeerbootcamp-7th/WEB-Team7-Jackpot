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
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class TextDeltaService {

    private static final int FLUSH_THRESHOLD = 20;

    private final TextDeltaRedisRepository textDeltaRedisRepository;
    private final QnARepository qnARepository;
    private final TextMerger textMerger;

    /**
     * 버전 카운터를 초기화하고 pending 키 TTL을 설정한다.
     * {@code ShareLinkService.getQnAWithVersion()} 에서 세션 시작 시 1회 호출된다.
     *
     * <p>pending 키가 이미 존재하면 TTL이 갱신되고,
     * 존재하지 않으면 EXPIRE는 no-op이다. 세션 중 flush로 pending 키가 삭제된 후
     * 생성되는 새 pending 키의 TTL은 disconnect/deactivation flush로 데이터 유실을 방지한다.</p>
     */
    public void initDeltaVersion(Long qnAId, Long dbVersion) {
        textDeltaRedisRepository.initVersionIfAbsent(qnAId, dbVersion);
        textDeltaRedisRepository.refreshPendingTtl(qnAId);
    }

    /**
     * 해당 QnA의 Redis 델타 키(pending, committed, version)를 모두 삭제한다.
     * 공유 링크 비활성화 시 호출해 메모리를 회수한다.
     */
    public void cleanupDeltaKeys(Long qnAId) {
        textDeltaRedisRepository.cleanupKeys(qnAId);
        log.info("Redis 델타 키 정리 완료: qnAId={}", qnAId);
    }

    /**
     * 델타를 Redis pending에 저장하고, 이 델타의 절대 버전 번호를 반환한다.
     * DB 조회 없이 Redis INCR만으로 버전을 획득한다.
     * 버전 카운터가 없는 경우(Redis 재시작 등)에만 예외적으로 DB를 1회 조회해 재초기화한다.</p>
     *
     * @return 이 델타의 절대 버전 번호 (Reviewer에게 전달)
     */
    @Transactional
    public long saveAndMaybeFlush(Long qnAId, TextUpdateRequest request) {
        if (!textDeltaRedisRepository.versionExists(qnAId)) {
            log.warn("버전 카운터 유실 감지, DB에서 재초기화: qnAId={}", qnAId);
            QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
            textDeltaRedisRepository.initVersionIfAbsent(qnAId, qnA.getVersion());
        }

        long deltaVersion = textDeltaRedisRepository.pushAndIncrVersion(qnAId, request);
        long pendingSize = textDeltaRedisRepository.pendingSize(qnAId);
        log.debug("델타 저장: qnAId={}, deltaVersion={}, pendingSize={}", qnAId, deltaVersion, pendingSize);

        if (pendingSize >= FLUSH_THRESHOLD) {
            log.info("flush 임계값 도달: qnAId={}", qnAId);
            flushToDb(qnAId);
        }

        return deltaVersion;
    }

    /**
     * pending 델타를 즉시 DB에 flush한다.
     * 리뷰 생성 등 최신 DBText가 필요한 경우 직접 호출된다.
     */
    @Transactional
    public void flushToDb(Long qnAId) {
        List<TextUpdateRequest> deltas = textDeltaRedisRepository.getPending(qnAId);
        if (deltas.isEmpty()) {
            log.debug("flush 대상 pending 델타 없음: qnAId={}", qnAId);
            return;
        }

        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);

        // DB version을 기준으로 dirty 델타 제거 (Redis commit 실패 후 잔존 데이터 이중 적용 방지)
        // delta.version()은 push 직전 서버 버전이므로, delta.version() < dbVersion인 것은 이미 반영됨
        long dbVersion = qnA.getVersion();
        List<TextUpdateRequest> applicableDeltas = deltas.stream()
                .filter(d -> d.version() >= dbVersion)
                .toList();

        // getPending()으로 읽은 항목 수를 commit()에 전달해 그 이후 유입된 델타를 보존한다.
        long readCount = deltas.size();

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

    /**
     * 리뷰 처리(생성·삭제·승인) 후 Redis 버전 카운터를 DB version에 맞게 강제 갱신한다.
     */
    public void resetDeltaVersion(Long qnAId, long newVersion) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                try {
                    textDeltaRedisRepository.setVersion(qnAId, newVersion);
                    log.info("리뷰 처리 후 버전 카운터 갱신 완료: qnAId={}, newVersion={}", qnAId, newVersion);
                } catch (Exception e) {
                    log.error("리뷰 처리 후 버전 카운터 갱신 실패: qnAId={}, newVersion={}", qnAId, newVersion, e);
                }
            }
        });
    }

    /**
     * OT 변환에 필요한 델타를 committed + pending에서 수집한다.
     * fromVersion 이상의 델타를 version 오름차순으로 반환한다.
     */
    public List<TextUpdateRequest> getOtDeltasSince(Long qnAId, long fromVersion) {
        List<TextUpdateRequest> committed = textDeltaRedisRepository.getCommitted(qnAId);
        List<TextUpdateRequest> pending = textDeltaRedisRepository.getPending(qnAId);
        return Stream.concat(committed.stream(), pending.stream()) // version asc
                .filter(d -> d.version() >= fromVersion)
                .toList();
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
    @Transactional
    public WebSocketMessageResponse recoverTextReplaceAll(Long qnAId) {
        return buildTextReplaceAllResponse(qnAId);
    }

    /**
     * saveAndMaybeFlush에서 push 이후 실제 오류(예: flushToDb 실패) 발생 시 텍스트 상태를 동기화하기 위한 메시지를 반환한다.
     *
     * <p>push가 완료된 마지막 델타를 Redis에서 롤백한 뒤
     * DB 텍스트와 나머지 pending 델타를 병합한 결과를 담은 TEXT_REPLACE_ALL 메시지를 반환한다.</p>
     */
    @Transactional
    public WebSocketMessageResponse recoverTextReplaceAllWithRollback(Long qnAId) {
        try {
            textDeltaRedisRepository.rollbackLastPush(qnAId);
        } catch (Exception e) {
            log.error("rollbackLastPush 실패: qnAId={}", qnAId, e);
        }
        return buildTextReplaceAllResponse(qnAId);
    }

    private WebSocketMessageResponse buildTextReplaceAllResponse(Long qnAId) {
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);

        List<TextUpdateRequest> deltas;
        try {
            deltas = textDeltaRedisRepository.getPending(qnAId);
        } catch (Exception e) {
            log.error("pending 델타 조회 실패, DB 텍스트로 대체: qnAId={}", qnAId, e);
            deltas = Collections.emptyList();
        }

        // flushToDb와 동일한 패턴: DB version 기준으로 이미 반영된 stale 델타 제거
        long dbVersion = qnA.getVersion();
        List<TextUpdateRequest> applicableDeltas = deltas.stream()
                .filter(d -> d.version() >= dbVersion)
                .toList();

        String newAnswer = textMerger.merge(qnA.getAnswer(), applicableDeltas);
        qnA.editAnswer(newAnswer);
        long version = qnARepository.incrementVersion(qnAId, applicableDeltas.size());

        log.info("TEXT_REPLACE_ALL 메시지 생성: qnAId={}, version={}", qnAId, version);
        WebSocketTextReplaceAllMessage message = new WebSocketTextReplaceAllMessage(version, newAnswer);
        return new WebSocketMessageResponse(WebSocketMessageType.TEXT_REPLACE_ALL, qnAId, message);
    }
}