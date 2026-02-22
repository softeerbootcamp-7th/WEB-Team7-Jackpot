package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.controller.response.ReviewsGetResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.event.ReviewCreatedEvent;
import com.jackpot.narratix.domain.event.ReviewDeleteEvent;
import com.jackpot.narratix.domain.event.ReviewEditEvent;
import com.jackpot.narratix.domain.exception.ReviewErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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
    private final QnATextService qnATextService;
    private final TextDeltaService textDeltaService;
    private final OTTransformer otTransformer;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;
    private final QnAService qnAService;

    public void createReview(String reviewerId, Long qnAId, ReviewCreateRequest request) {
        // 1. Transaction 밖에서 pending 델타를 DB에 먼저 적용
        List<TextUpdateRequest> deltas = textSyncService.getPendingDeltas(qnAId);
        textSyncService.flushDeltasToDb(qnAId, deltas, deltas.size());

        // 2. QnA 조회 및 컨텍스트 준비
        QnA qnA = qnAService.findByIdOrElseThrow(qnAId);
        CoverLetter coverLetter = qnA.getCoverLetter();
        Long coverLetterId = coverLetter.getId();
        String writerId = coverLetter.getUserId();
        String notificationTitle = coverLetter.getCompanyName() + " " + coverLetter.getApplyYear() + " " + coverLetter.getApplyHalf().getDescription();

        reviewService.validateWebSocketConnected(reviewerId, coverLetterId, ReviewRoleType.REVIEWER);

        // 3. OT 변환
        long reviewerVersion = request.version();
        long currentVersion = qnA.getVersion();
        int transformedStart = request.startIdx().intValue();
        int transformedEnd = request.endIdx().intValue();

        if (reviewerVersion < currentVersion) {
            List<TextUpdateRequest> otDeltas = textDeltaService.getOtDeltasSince(qnAId, reviewerVersion);
            boolean hasOtHistorySinceReviewerVersion = !otDeltas.isEmpty() && otDeltas.get(0).version() == reviewerVersion;
            if (!hasOtHistorySinceReviewerVersion) {
                throw new BaseException(ReviewErrorCode.REVIEW_VERSION_TOO_OLD);
            }
            int[] transformed = otTransformer.transformRange(transformedStart, transformedEnd, otDeltas);
            transformedStart = transformed[0];
            transformedEnd = transformed[1];
        } else if (reviewerVersion > currentVersion) {
            throw new BaseException(ReviewErrorCode.REVIEW_VERSION_AHEAD);
        }

        // 4. originText 검증
        String currentAnswer = qnA.getAnswer() != null ? qnA.getAnswer() : "";
        reviewService.validateOriginText(request.originText(), currentAnswer, transformedStart, transformedEnd);

        // 5. Review 엔티티 생성
        Review review = reviewService.createReview(reviewerId, qnAId, request);

        // 6. 텍스트 마킹 및 QnA 업데이트
        String wrappedAnswer = reviewService.addMarkerToReviewedSection(
                currentAnswer, transformedStart, transformedEnd, review.getId(), request.originText()
        );
        qnATextService.updateAnswerAndPublishEvent(qnAId, coverLetterId, wrappedAnswer);

        // 7. 이벤트 발행
        eventPublisher.publishEvent(ReviewCreatedEvent.of(coverLetterId, qnAId, review));

        // 8. 알림 전송
        notificationService.sendFeedbackNotificationToWriter(
                reviewerId, writerId, notificationTitle, coverLetterId, qnAId, request.originText()
        );
    }

    @Transactional
    public void editReview(String userId, Long qnAId, Long reviewId, ReviewEditRequest request) {
        Review updatedReview = reviewService.editReview(userId, qnAId, reviewId, request);
        Long coverLetterId = qnAService.getCoverLetterIdByQnAIdOrElseThrow(qnAId);
        eventPublisher.publishEvent(ReviewEditEvent.of(coverLetterId, qnAId, updatedReview));
    }

    public void deleteReview(String userId, Long qnAId, Long reviewId) {
        // 1. flush: pending 델타를 DB에 먼저 적용 (트랜잭션 밖)
        List<TextUpdateRequest> deltas = textSyncService.getPendingDeltas(qnAId);
        textSyncService.flushDeltasToDb(qnAId, deltas, deltas.size());

        // 2. QnA, Review 조회
        QnA qnA = qnAService.findByIdOrElseThrow(qnAId);
        Long coverLetterId = qnA.getCoverLetter().getId();
        ReviewRoleType role = qnA.determineReviewRole(userId);

        reviewService.validateWebSocketConnected(userId, coverLetterId, role);

        Optional<Review> reviewOptional = reviewService.findById(reviewId);
        if (reviewOptional.isEmpty()) return;
        Review review = reviewOptional.get();

        // 3. 검증
        reviewService.validateReviewBelongsToQnA(review, qnAId);
        reviewService.validateIsReviewOwnerOrQnAOwner(userId, review, qnA);

        // 4. 마커 제거 및 QnA 업데이트
        String currentAnswer = qnA.getAnswer() != null ? qnA.getAnswer() : "";

        if (reviewService.containsMarker(currentAnswer, reviewId, review.getOriginText())) {
            String unwrapped = reviewService.removeReviewMarker(currentAnswer, reviewId, review.getOriginText());
            qnATextService.updateAnswerAndPublishEvent(qnAId, coverLetterId, unwrapped);
        } else {
            log.warn("리뷰 마커를 찾을 수 없음, 텍스트 변경 없이 삭제 진행: qnAId={}, reviewId={}", qnAId, reviewId);
        }

        // 5. Review 삭제
        reviewService.deleteReview(reviewId);

        // 6. 이벤트 발행
        eventPublisher.publishEvent(new ReviewDeleteEvent(coverLetterId, qnAId, reviewId));
    }

    /**
     * 리뷰 승인/취소
     */
    public void approveReview(String userId, Long qnAId, Long reviewId) {
        // 1. flush: pending 델타를 DB에 먼저 적용 (트랜잭션 밖)
        List<TextUpdateRequest> deltas = textSyncService.getPendingDeltas(qnAId);
        textSyncService.flushDeltasToDb(qnAId, deltas, deltas.size());

        // 2. QnA, Review 조회
        QnA qnA = qnAService.findByIdOrElseThrow(qnAId);
        Long coverLetterId = qnA.getCoverLetter().getId();

        reviewService.validateWebSocketConnected(userId, coverLetterId, ReviewRoleType.WRITER);

        Review review = reviewService.getReview(reviewId);

        // 3. 검증
        reviewService.validateReviewBelongsToQnA(review, qnAId);
        reviewService.validateIsQnAOwner(userId, qnA);

        // 4. 승인/취소
        reviewService.toggleApproval(review);

        // 5. 마커 교체 및 QnA 업데이트
        String currentAnswer = qnA.getAnswer() != null ? qnA.getAnswer() : "";
        String oldContent = review.isApproved() ? review.getOriginText() : review.getSuggest();
        String newContent = review.isApproved() ? review.getSuggest() : review.getOriginText();

        if (reviewService.containsMarker(currentAnswer, reviewId, oldContent)) {
            String newAnswer = reviewService.replaceMarkerContent(currentAnswer, reviewId, oldContent, newContent);
            qnATextService.updateAnswerAndPublishEvent(qnAId, coverLetterId, newAnswer);
        } else {
            log.warn("리뷰 마커를 찾을 수 없음, 상태 토글만 진행: qnAId={}, reviewId={}", qnAId, reviewId);
        }

        // 6. 이벤트 발행
        eventPublisher.publishEvent(ReviewEditEvent.of(coverLetterId, qnAId, review));
    }

    public ReviewsGetResponse getAllReviews(String userId, Long qnAId) {
        return reviewService.getAllReviews(userId, qnAId);
    }
}