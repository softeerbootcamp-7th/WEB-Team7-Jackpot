package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.controller.response.ReviewsGetResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.event.ReviewCreatedEvent;
import com.jackpot.narratix.domain.event.ReviewDeleteEvent;
import com.jackpot.narratix.domain.event.ReviewEditEvent;
import com.jackpot.narratix.domain.event.TextReplaceAllEvent;
import com.jackpot.narratix.domain.exception.OptimisticLockException;
import com.jackpot.narratix.domain.exception.ReviewErrorCode;
import com.jackpot.narratix.domain.exception.ReviewSyncRequiredException;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

/**
 * Review 관련 작업의 진입점 (Facade).
 * 여러 도메인 서비스를 조율하고 트랜잭션 경계를 관리한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewFacade {

    private final TextSyncService textSyncService;
    private final ReviewService reviewService;
    private final OTTransformer otTransformer;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;
    private final QnAService qnAService;
    private final TransactionTemplate transactionTemplate;
    private final TextMerger textMerger;

    @Retryable(
            retryFor = {OptimisticLockException.class, ReviewSyncRequiredException.class},
            maxAttempts = 3,  // 초기 시도 1회 + 재시도 2회
            backoff = @Backoff(delay = 0),
            recover = "recoverCreateReview"
    )
    public void createReview(String reviewerId, Long qnAId, ReviewCreateRequest request) {
        // Transaction 1: QnA/CoverLetter 조회 및 WebSocket 연결 검증
        CoverLetterAndQnAInfo coverLetterAndQnAInfo = getCoverLetterAndQnAInfoAndValidateWebSocketConnected(qnAId, reviewerId);

        List<TextUpdateRequest> committedDeltas = textSyncService.getCommittedDeltas(qnAId);
        List<TextUpdateRequest> pendingDeltas = textSyncService.getPendingDeltas(qnAId);
        List<TextUpdateRequest> allDeltas = Stream.concat(committedDeltas.stream(), pendingDeltas.stream()).toList();

        int transformedStart = request.startIdx().intValue();
        int transformedEnd = request.endIdx().intValue();

        long reviewerVersion = request.version();

        if (!allDeltas.isEmpty()) { // Delta가 존재하지 않거나 reviewerVersion과 mostRecentDeltaVersion이 같으면, QnA 버전이 최신이라는 의미이므로 OT 변환이 불필요하다.
            long mostRecentDeltaVersion = allDeltas.get(allDeltas.size() - 1).version();
            long oldestDeltaVersion = allDeltas.get(0).version();

            // OT 변환에 필요한 Delta만 필터링한다. reviewerVersion이 1이면, version 2,3,4, ... 인 델타가 OT 변환에 포함된다.
            if (reviewerVersion < mostRecentDeltaVersion) {
                List<TextUpdateRequest> otDeltas = allDeltas.stream()
                        .filter(d -> d.version() > reviewerVersion)
                        .toList();

                // 가장 오래된 델타의 버전이 reviewerVersion보다 작거나 같아야 OT 변환이 가능하다. (reviewerVersion 이후의 델타가 존재해야 한다.)
                boolean isHistoryRetained = oldestDeltaVersion <= reviewerVersion + 1;
                boolean hasNoVersionGap = !otDeltas.isEmpty() && otDeltas.get(0).version() == reviewerVersion + 1;
                if (!isHistoryRetained || !hasNoVersionGap) {
                    log.warn("OT 변환 실패: reviewerVersion={}, oldestDeltaVersion={}, mostRecentDeltaVersion={}, otDeltas={}",
                            reviewerVersion, oldestDeltaVersion, mostRecentDeltaVersion, otDeltas);
                    throw new ReviewSyncRequiredException(ReviewErrorCode.REVIEW_VERSION_TOO_OLD, qnAId);
                }

                try {
                    int[] transformed = otTransformer.transformRange(transformedStart, transformedEnd, otDeltas);
                    transformedStart = transformed[0];
                    transformedEnd = transformed[1];
                } catch (BaseException e) {
                    if (e.getErrorCode() == ReviewErrorCode.REVIEW_TEXT_MISMATCH) {
                        log.warn("OT 변환 중 범위 삭제 감지. qnAId={}, start={}, end={}", qnAId, transformedStart, transformedEnd);
                        throw new ReviewSyncRequiredException(ReviewErrorCode.REVIEW_TEXT_MISMATCH, qnAId);
                    }
                    throw e;
                }
            } else if (reviewerVersion > mostRecentDeltaVersion) {
                log.warn("리뷰 버전이 최신 버전보다 앞서 있습니다. qnAId={}, reviewerVersion={}, mostRecentDeltaVersion={}",
                        qnAId, reviewerVersion, mostRecentDeltaVersion);
                throw new ReviewSyncRequiredException(ReviewErrorCode.REVIEW_VERSION_AHEAD, qnAId);
            }
        }

        // pending delta까지 병합된 결과에서 리뷰 originText가 유효한지 검증한다.
        String currentAnswer = coverLetterAndQnAInfo.qnAAnswer != null ? coverLetterAndQnAInfo.qnAAnswer : "";
        String mergedAnswer = textMerger.merge(currentAnswer, pendingDeltas);
        reviewService.validateOriginText(request.originText(), mergedAnswer, transformedStart, transformedEnd, qnAId);

        // Transaction 2: Review 생성 및 QnA 업데이트 & 이벤트 발행
        Long coverLetterId = coverLetterAndQnAInfo.coverLetterId;
        Long expectedVersion = coverLetterAndQnAInfo.qnAVersion;
        createReviewAndUpdateAnswer(
                reviewerId, qnAId, coverLetterId, request, mergedAnswer, transformedStart, transformedEnd, pendingDeltas.size(), expectedVersion
        );

        // Transaction 3: 알림 전송
        String notificationTitle = coverLetterAndQnAInfo.companyName() + " " + coverLetterAndQnAInfo.applyYear() + " " + coverLetterAndQnAInfo.applyHalf().getDescription();
        notificationService.sendFeedbackNotificationToWriter(
                reviewerId, coverLetterAndQnAInfo.writerId, notificationTitle,
                coverLetterId, qnAId, request.originText()
        );
    }

    @Transactional
    public void editReview(String userId, Long qnAId, Long reviewId, ReviewEditRequest request) {
        Review updatedReview = reviewService.editReview(userId, qnAId, reviewId, request);
        Long coverLetterId = qnAService.getCoverLetterIdByQnAIdOrElseThrow(qnAId);
        eventPublisher.publishEvent(ReviewEditEvent.of(coverLetterId, qnAId, updatedReview));
    }

    @Retryable(
            retryFor = OptimisticLockException.class,
            maxAttempts = 3,  // 초기 시도 1회 + 재시도 2회
            backoff = @Backoff(delay = 0),
            recover = "recoverDeleteReview"
    )
    public void deleteReview(String userId, Long qnAId, Long reviewId) {
        // 트랜잭션 전: pending delta 조회
        List<TextUpdateRequest> pendingDeltas = textSyncService.getPendingDeltas(qnAId);
        long pendingDeltaCount = pendingDeltas.size();

        // Transaction: 모든 작업을 하나의 트랜잭션에서 처리
        transactionTemplate.executeWithoutResult(status -> {
            // QnA, Review 조회 및 검증
            QnA qnA = qnAService.findByIdOrElseThrow(qnAId);
            Long expectedVersion = qnA.getVersion();
            CoverLetter coverLetter = qnA.getCoverLetter();
            Long coverLetterId = coverLetter.getId();
            ReviewRoleType role = qnA.determineReviewRole(userId);

            reviewService.validateWebSocketConnected(userId, coverLetterId, role);

            Optional<Review> reviewOptional = reviewService.findById(reviewId);
            if (reviewOptional.isEmpty()) return;
            Review review = reviewOptional.get();

            // 검증
            reviewService.validateReviewBelongsToQnA(review, qnAId);
            reviewService.validateIsReviewOwnerOrQnAOwner(userId, review, qnA);

            // pending delta를 병합
            String mergedAnswer = textMerger.merge(qnA.getAnswer(), pendingDeltas);

            // 리뷰 마커 제거
            String answerWithoutMarker = reviewService.removeReviewMarker(mergedAnswer, reviewId);

            // Review 삭제
            reviewService.deleteReview(reviewId);

            // QnA 업데이트 & pending을 committed로 이동 & pending 조회 이후 유입된 delta는 제거
            long newVersion = textSyncService.updateAnswerCommitAndClearOldCommitted(qnAId, answerWithoutMarker, pendingDeltaCount, expectedVersion);

            // 트랜잭션 커밋 후 이벤트 발행
            eventPublisher.publishEvent(new TextReplaceAllEvent(coverLetterId, qnAId, newVersion, answerWithoutMarker));
            eventPublisher.publishEvent(new ReviewDeleteEvent(coverLetterId, qnAId, reviewId));
        });
    }

    /**
     * 리뷰 승인/취소
     */
    @Retryable(
            retryFor = OptimisticLockException.class,
            maxAttempts = 3,  // 초기 시도 1회 + 재시도 2회
            backoff = @Backoff(delay = 0),
            recover = "recoverApproveReview"
    )
    public void approveReview(String userId, Long qnAId, Long reviewId) {
        // 트랜잭션 전: pending delta 조회
        List<TextUpdateRequest> pendingDeltas = textSyncService.getPendingDeltas(qnAId);
        long pendingDeltaCount = pendingDeltas.size();

        // Transaction: 모든 작업을 하나의 트랜잭션에서 처리
        transactionTemplate.executeWithoutResult(status -> {
            // QnA, Review 조회 및 웹소켓 유저 검증
            QnA qnA = qnAService.findByIdOrElseThrow(qnAId);
            Long expectedVersion = qnA.getVersion();
            Review review = reviewService.getReview(reviewId);
            Long coverLetterId = qnA.getCoverLetter().getId();
            reviewService.validateWebSocketConnected(userId, coverLetterId, ReviewRoleType.WRITER);

            // 검증
            reviewService.validateReviewBelongsToQnA(review, qnAId);
            reviewService.validateIsQnAOwner(userId, qnA);

            // pending delta를 병합
            String mergedAnswer = textMerger.merge(qnA.getAnswer(), pendingDeltas);

            // 마커 교체 (항상 originText를 suggest로 변경해야 한다.)
            String oldContent = review.getOriginText();
            String newContent = review.getSuggest();
            String approvedAnswer = reviewService.replaceMarkerContent(mergedAnswer, reviewId, oldContent, newContent);

            // 승인/취소 토글
            reviewService.toggleApproval(review);

            // QnA 업데이트 & pending을 committed로 이동 & pending 조회 이후 유입된 delta는 제거
            long newVersion = textSyncService.updateAnswerCommitAndClearOldCommitted(qnAId, approvedAnswer, pendingDeltaCount, expectedVersion);

            // 트랜잭션 커밋 후 이벤트 발행
            eventPublisher.publishEvent(new TextReplaceAllEvent(coverLetterId, qnAId, newVersion, approvedAnswer));
            eventPublisher.publishEvent(ReviewEditEvent.of(coverLetterId, qnAId, review));
        });
    }

    public ReviewsGetResponse getAllReviews(String userId, Long qnAId) {
        return reviewService.getAllReviews(userId, qnAId);
    }

    private CoverLetterAndQnAInfo getCoverLetterAndQnAInfoAndValidateWebSocketConnected(Long qnAId, String reviewerId) {
        return transactionTemplate.execute(transactionStatus -> {
            QnA qnA = qnAService.findByIdOrElseThrow(qnAId);
            CoverLetter coverLetter = qnA.getCoverLetter();
            reviewService.validateWebSocketConnected(reviewerId, coverLetter.getId(), ReviewRoleType.REVIEWER);

            return new CoverLetterAndQnAInfo(
                    coverLetter.getId(),
                    coverLetter.getUserId(),
                    coverLetter.getCompanyName(),
                    coverLetter.getApplyYear(),
                    coverLetter.getApplyHalf(),
                    qnA.getId(),
                    qnA.getAnswer(),
                    qnA.getVersion()
            );
        });
    }

    private record CoverLetterAndQnAInfo(
            Long coverLetterId,
            String writerId,
            String companyName,
            Integer applyYear,
            ApplyHalfType applyHalf,
            Long qnAId,
            String qnAAnswer,
            Long qnAVersion
    ) {
    }

    private void createReviewAndUpdateAnswer(
            String reviewerId,
            Long qnAId,
            Long coverLetterId,
            ReviewCreateRequest request,
            String mergedAnswer,
            int transformedStart,
            int transformedEnd,
            long pendingDeltaCount,
            Long expectedVersion
    ) {
        transactionTemplate.executeWithoutResult(transactionStatus -> {
            // Review 생성
            Review review = reviewService.createReview(reviewerId, qnAId, request);

            // 최신 answer에 마커 추가
            String wrappedAnswer = reviewService.addMarkerToReviewedSection(
                    mergedAnswer, transformedStart, transformedEnd,
                    review.getId(), review.getOriginText()
            );

            // QnA 업데이트 및 pending/committed delta 삭제 (Reviewer를 위한 OT 히스토리 정리)
            long newVersion = textSyncService.updateAnswerAndClearDeltas(qnAId, wrappedAnswer, pendingDeltaCount, expectedVersion);

            // 트랜잭션 커밋 후 이벤트 발행
            eventPublisher.publishEvent(new TextReplaceAllEvent(coverLetterId, qnAId, newVersion, wrappedAnswer));
            eventPublisher.publishEvent(ReviewCreatedEvent.of(coverLetterId, qnAId, review));
        });
    }

    @Recover
    public void recoverCreateReview(OptimisticLockException e, String reviewerId, Long qnAId, ReviewCreateRequest request) {
        log.warn("리뷰 생성 재시도 실패 (OptimisticLock). 최신 QnA 값으로 TEXT_REPLACE_ALL 이벤트 발행. qnAId={}, reviewerId={}", qnAId, reviewerId);
        publishLatestQnAStateWithPendingDeltas(qnAId);
        throw new BaseException(e.getErrorCode());
    }

    @Recover
    public void recoverCreateReview(ReviewSyncRequiredException e, String reviewerId, Long qnAId, ReviewCreateRequest request) {
        log.warn("리뷰 생성 재시도 실패 (정합성 불일치). 최신 QnA 값으로 TEXT_REPLACE_ALL 이벤트 발행. qnAId={}, reviewerId={}, errorCode={}",
                qnAId, reviewerId, e.getErrorCode());
        publishLatestQnAStateWithPendingDeltas(qnAId);
        throw new BaseException(e.getErrorCode());
    }

    @Recover
    public void recoverDeleteReview(OptimisticLockException e, String userId, Long qnAId, Long reviewId) {
        log.warn("리뷰 삭제 재시도 실패. 최신 QnA 값으로 TEXT_REPLACE_ALL 이벤트 발행. qnAId={}, reviewId={}, userId={}", qnAId, reviewId, userId);
        publishLatestQnAStateWithPendingDeltas(qnAId);
        throw new BaseException(e.getErrorCode());
    }

    @Recover
    public void recoverApproveReview(OptimisticLockException e, String userId, Long qnAId, Long reviewId) {
        log.warn("리뷰 승인/취소 재시도 실패. 최신 QnA 값으로 TEXT_REPLACE_ALL 이벤트 발행. qnAId={}, reviewId={}, userId={}", qnAId, reviewId, userId);
        publishLatestQnAStateWithPendingDeltas(qnAId);
        throw new BaseException(e.getErrorCode());
    }

    /**
     * 최신 QnA 상태(DB answer + pending delta 병합)를 조회하여 TEXT_REPLACE_ALL 이벤트를 발행한다.
     * 낙관적 락 재시도 실패 시 클라이언트를 최신 상태로 동기화하기 위해 사용된다.
     */
    private void publishLatestQnAStateWithPendingDeltas(Long qnAId) {
        // 트랜잭션 외부에서 pending delta 조회 (Redis)
        List<TextUpdateRequest> pendingDeltas = textSyncService.getPendingDeltas(qnAId);

        // 트랜잭션 내부에서 QnA 조회 및 병합
        transactionTemplate.executeWithoutResult(status -> {
            QnA qnA = qnAService.findByIdOrElseThrow(qnAId);
            Long coverLetterId = qnA.getCoverLetter().getId();
            Long dbVersion = qnA.getVersion();
            String dbAnswer = qnA.getAnswer() != null ? qnA.getAnswer() : "";

            // pending delta를 병합하여 최신 상태 생성
            String latestAnswer = textMerger.merge(dbAnswer, pendingDeltas);
            Long latestVersion = dbVersion + pendingDeltas.size();

            log.info("최신 QnA 상태 발행 (pending delta 병합): coverLetterId={}, qnAId={}, dbVersion={}, pendingDeltaCount={}, latestVersion={}",
                    coverLetterId, qnAId, dbVersion, pendingDeltas.size(), latestVersion);

            eventPublisher.publishEvent(new TextReplaceAllEvent(coverLetterId, qnAId, latestVersion, latestAnswer));
        });
    }
}