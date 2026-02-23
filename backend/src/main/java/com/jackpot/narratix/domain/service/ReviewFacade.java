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
import com.jackpot.narratix.domain.exception.ReviewErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
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
    private final TextDeltaService textDeltaService;
    private final OTTransformer otTransformer;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;
    private final QnAService qnAService;
    private final TransactionTemplate transactionTemplate;
    private final TextMerger textMerger;

    public void createReview(String reviewerId, Long qnAId, ReviewCreateRequest request) {
        // Transaction 1: QnA/CoverLetter 조회 및 WebSocket 연결 검증
        CoverLetterAndQnAInfo coverLetterAndQnAInfo = getCoverLetterAndQnAInfoAndValidateWebSocketConnected(qnAId, reviewerId);

        // delta를 가져온다.
        List<TextUpdateRequest> committedDeltas = textDeltaService.getCommittedDeltas(qnAId);
        List<TextUpdateRequest> pendingDeltas = textSyncService.getPendingDeltas(qnAId);
        long pendingDeltaCount = pendingDeltas.size();

        // Review 구간을 OT로 변환하기 위해 committed delta와 pending delta를 이용해 transformed range를 계산한다.
        long reviewerVersion = request.version();
        long currentVersion = coverLetterAndQnAInfo.qnAVersion;
        int transformedStart = request.startIdx().intValue();
        int transformedEnd = request.endIdx().intValue();

        if (reviewerVersion < currentVersion) {
            List<TextUpdateRequest> otDeltas = Stream.concat(committedDeltas.stream(), pendingDeltas.stream())
                    .filter(d -> d.version() > reviewerVersion)
                    .toList(); // OT 변환에 필요한 델타만 추출 (reviewerVersion 이후의 델타)
            boolean hasOtHistorySinceReviewerVersion = !otDeltas.isEmpty() && otDeltas.get(0).version() == reviewerVersion + 1;
            if (!hasOtHistorySinceReviewerVersion) {
                throw new BaseException(ReviewErrorCode.REVIEW_VERSION_TOO_OLD);
            }
            int[] transformed = otTransformer.transformRange(transformedStart, transformedEnd, otDeltas);
            transformedStart = transformed[0];
            transformedEnd = transformed[1];
        } else if (reviewerVersion > currentVersion) {
            throw new BaseException(ReviewErrorCode.REVIEW_VERSION_AHEAD);
        }

        // pending delta까지 병합된 결과에서 리뷰 originText가 유효한지 검증한다.
        String currentAnswer = coverLetterAndQnAInfo.qnAAnswer != null ? coverLetterAndQnAInfo.qnAAnswer : "";
        String mergedAnswer = textMerger.merge(currentAnswer, pendingDeltas);
        reviewService.validateOriginText(request.originText(), mergedAnswer, transformedStart, transformedEnd);

        // Transaction 2: Review 생성 및 QnA 업데이트
        ReviewCreationResult result = createReviewAndUpdateAnswer(
                reviewerId, qnAId, request, mergedAnswer, transformedStart, transformedEnd, pendingDeltaCount
        );

        // 이벤트 발행
        Long coverLetterId = coverLetterAndQnAInfo.coverLetterId;
        eventPublisher.publishEvent(new TextReplaceAllEvent(coverLetterId, qnAId, result.newVersion(), result.wrappedAnswer()));
        eventPublisher.publishEvent(ReviewCreatedEvent.of(coverLetterId, qnAId, result.review()));

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

    public void deleteReview(String userId, Long qnAId, Long reviewId) {
        // 트랜잭션 전: pending delta 조회
        List<TextUpdateRequest> pendingDeltas = textSyncService.getPendingDeltas(qnAId);
        long pendingDeltaCount = pendingDeltas.size();

        // Transaction: 모든 작업을 하나의 트랜잭션에서 처리
        ReviewDeletionResult result = transactionTemplate.execute(status -> {
            // QnA, Review 조회 및 검증
            QnA qnA = qnAService.findByIdOrElseThrow(qnAId);
            CoverLetter coverLetter = qnA.getCoverLetter();
            Long coverLetterId = coverLetter.getId();
            ReviewRoleType role = qnA.determineReviewRole(userId);

            reviewService.validateWebSocketConnected(userId, coverLetterId, role);

            Optional<Review> reviewOptional = reviewService.findById(reviewId);
            if (reviewOptional.isEmpty()) return null;
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
            long newVersion = textSyncService.updateAnswerCommitAndClearOldCommitted(qnAId, answerWithoutMarker, pendingDeltaCount);

            return new ReviewDeletionResult(coverLetterId, newVersion, answerWithoutMarker);
        });

        // 트랜잭션 밖에서 이벤트 발행
        if (result != null) {
            eventPublisher.publishEvent(new TextReplaceAllEvent(result.coverLetterId(), qnAId, result.newVersion(), result.answerWithoutMarker()));
            eventPublisher.publishEvent(new ReviewDeleteEvent(result.coverLetterId(), qnAId, reviewId));
        }
    }

    private record ReviewDeletionResult(
            Long coverLetterId,
            long newVersion,
            String answerWithoutMarker
    ) {}

    /**
     * 리뷰 승인/취소
     */
    public void approveReview(String userId, Long qnAId, Long reviewId) {
        // 트랜잭션 전: pending delta 조회
        List<TextUpdateRequest> pendingDeltas = textSyncService.getPendingDeltas(qnAId);
        long pendingDeltaCount = pendingDeltas.size();

        // Transaction: 모든 작업을 하나의 트랜잭션에서 처리
        ReviewApprovalResult result = transactionTemplate.execute(status -> {
            // QnA, Review 조회 및 검증
            QnA qnA = qnAService.findByIdOrElseThrow(qnAId);
            Long coverLetterId = qnA.getCoverLetter().getId();

            reviewService.validateWebSocketConnected(userId, coverLetterId, ReviewRoleType.WRITER);

            Review review = reviewService.getReview(reviewId);

            // 검증
            reviewService.validateReviewBelongsToQnA(review, qnAId);
            reviewService.validateIsQnAOwner(userId, qnA);

            // pending delta를 병합
            String mergedAnswer = textMerger.merge(qnA.getAnswer(), pendingDeltas);

            // 승인/취소 토글
            reviewService.toggleApproval(review);

            // 마커 교체
            String oldContent = review.isApproved() ? review.getOriginText() : review.getSuggest();
            String newContent = review.isApproved() ? review.getSuggest() : review.getOriginText();
            
            String newAnswer = reviewService.replaceMarkerContent(mergedAnswer, reviewId, oldContent, newContent);

            // QnA 업데이트 & pending을 committed로 이동 & pending 조회 이후 유입된 delta는 제거
            long newVersion = textSyncService.updateAnswerCommitAndClearOldCommitted(qnAId, newAnswer, pendingDeltaCount);

            return new ReviewApprovalResult(coverLetterId, newVersion, newAnswer, review);
        });

        // 트랜잭션 밖에서 이벤트 발행
        if (result != null) {
            eventPublisher.publishEvent(new TextReplaceAllEvent(result.coverLetterId(), qnAId, result.newVersion(), result.newAnswer()));
            eventPublisher.publishEvent(ReviewEditEvent.of(result.coverLetterId(), qnAId, result.review()));
        }
    }

    private record ReviewApprovalResult(
            Long coverLetterId,
            long newVersion,
            String newAnswer,
            Review review
    ) {}

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

    private ReviewCreationResult createReviewAndUpdateAnswer(
            String reviewerId,
            Long qnAId,
            ReviewCreateRequest request,
            String mergedAnswer,
            int transformedStart,
            int transformedEnd,
            long pendingDeltaCount
    ) {
        return transactionTemplate.execute(transactionStatus -> {
            // Review 생성
            Review newReview = reviewService.createReview(reviewerId, qnAId, request);

            // 최신 answer에 마커 추가
            String wrappedAnswer = reviewService.addMarkerToReviewedSection(
                    mergedAnswer, transformedStart, transformedEnd,
                    newReview.getId(), newReview.getOriginText()
            );

            // QnA 업데이트 및 pending/committed delta 삭제 (Reviewer를 위한 OT 히스토리 정리)
            long newVersion = textSyncService.updateAnswerAndClearDeltas(qnAId, wrappedAnswer, pendingDeltaCount);

            return new ReviewCreationResult(newReview, newVersion, wrappedAnswer);
        });
    }

    private record ReviewCreationResult(
            Review review,
            long newVersion,
            String wrappedAnswer
    ) {}

}