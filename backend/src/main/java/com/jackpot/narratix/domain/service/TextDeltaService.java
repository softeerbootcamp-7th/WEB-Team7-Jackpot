package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.TextDeltaRedisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TextDeltaService {

    static final int FLUSH_THRESHOLD = 20;

    private final TextDeltaRedisRepository textDeltaRedisRepository;
    private final QnARepository qnARepository;
    private final TextMerger textMerger;

    /**
     * 버전 카운터를 초기화한다
     * {@code ShareLinkService.getQnAWithVersion()} 에서 세션 시작 시 1회 호출
     */
    public void initDeltaVersion(Long qnAId, Long dbVersion) {
        textDeltaRedisRepository.initVersionIfAbsent(qnAId, dbVersion);
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
        String newAnswer = textMerger.merge(qnA.getAnswer(), deltas);
        qnA.editAnswer(newAnswer);
        qnA.incrementVersionBy(deltas.size());

        long committedDeltaCount = textDeltaRedisRepository.commit(qnAId);
        log.info("DB flush 완료: qnAId={}, newVersion={}, committed 수={}", qnAId, qnA.getVersion(), committedDeltaCount);
    }
}