package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.controller.response.ReviewsGetResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.event.ReviewDeleteEvent;
import com.jackpot.narratix.domain.event.ReviewEditEvent;
import com.jackpot.narratix.domain.event.TextReplaceAllEvent;
import com.jackpot.narratix.domain.exception.ReviewErrorCode;
import com.jackpot.narratix.domain.event.ReviewCreatedEvent;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ReviewRepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    static final String MARKER_CLOSE = "⟦/r⟧";

    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;
    private final ShareLinkSessionRegistry shareLinkSessionRegistry;
    private final TextDeltaService textDeltaService;
    private final OTTransformer otTransformer;

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final QnARepository qnARepository;

    @Transactional
    public void createReview(String reviewerId, Long qnAId, ReviewCreateRequest request) {
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        CoverLetter coverLetter = qnA.getCoverLetter();
        Long coverLetterId = coverLetter.getId();
        String writerId = coverLetter.getUserId();
        String notificationTitle = coverLetter.getCompanyName() + " " + coverLetter.getApplyYear() + " " + coverLetter.getApplyHalf().getDescription();
        validateWebSocketConnected(reviewerId, coverLetterId, ReviewRoleType.REVIEWER);

        // flush: JPA 컨텍스트의 qnA가 최신 answer·version으로 갱신됨
        textDeltaService.flushToDb(qnAId);

        long reviewerVersion = request.version();
        long currentVersion = qnA.getVersion();

        // OT 변환 (reviewerVersion == currentVersion이면 변환 불필요)
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

        // originText 검증
        String currentAnswer = qnA.getAnswer() != null ? qnA.getAnswer() : "";
        validateOriginText(request.originText(), currentAnswer, transformedStart, transformedEnd);

        // Review 엔티티 저장 (reviewId 확보)
        Review review = reviewRepository.save(request.toEntity(reviewerId, qnAId));

        // 텍스트 마킹 삽입
        String wrappedAnswer = addTagToReviewedSection(currentAnswer, transformedStart, transformedEnd, review.getId(), request.originText());
        qnA.editAnswer(wrappedAnswer);
        long reviewVersion = qnARepository.incrementVersion(qnAId, 1);

        // afterCommit: Redis version counter 강제 갱신
        textDeltaService.resetDeltaVersion(qnAId, reviewVersion);

        eventPublisher.publishEvent(new TextReplaceAllEvent(coverLetterId, qnAId, reviewVersion, wrappedAnswer));
        eventPublisher.publishEvent(ReviewCreatedEvent.of(coverLetterId, qnAId, review));

        notificationService.sendFeedbackNotificationToWriter(reviewerId, writerId, notificationTitle, qnAId, request.originText());
    }

    private String addTagToReviewedSection(String currentAnswer, int transformedStart, int transformedEnd, Long tagId, String originText) {
        return currentAnswer.substring(0, transformedStart)
                + markerOpen(tagId) + originText + MARKER_CLOSE
                + currentAnswer.substring(transformedEnd);
    }

    private void validateOriginText(String originText, String currentAnswer, int transformedStart, int transformedEnd) {
        String textAtRange = currentAnswer.substring(transformedStart, transformedEnd);
        if (!textAtRange.equals(originText)) {
            throw new BaseException(ReviewErrorCode.REVIEW_TEXT_MISMATCH);
        }
    }

    @Transactional
    public void editReview(String userId, Long qnAId, Long reviewId, ReviewEditRequest request) {
        Long coverLetterId = qnARepository.getCoverLetterIdByQnAIdOrElseThrow(qnAId);
        validateWebSocketConnected(userId, coverLetterId, ReviewRoleType.REVIEWER);
        Review review = reviewRepository.findByIdOrElseThrow(reviewId);

        validateReviewBelongsToQnA(review, qnAId);
        validateIsReviewOwner(userId, review);

        review.editSuggest(request.suggest());
        review.editComment(request.comment());
        Review updatedReview = reviewRepository.save(review);

        eventPublisher.publishEvent(ReviewEditEvent.of(coverLetterId, qnAId, updatedReview));
    }

    private void validateReviewBelongsToQnA(Review review, Long qnAId) {
        if (!review.belongsToQnA(qnAId)) throw new BaseException(ReviewErrorCode.REVIEW_NOT_BELONGS_TO_QNA);
    }

    private void validateIsReviewOwner(String userId, Review review) {
        if (!review.isOwner(userId)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    @Transactional
    public void deleteReview(String userId, Long qnAId, Long reviewId) {
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        Long coverLetterId = qnA.getCoverLetter().getId();
        ReviewRoleType role = qnA.determineReviewRole(userId);
        validateWebSocketConnected(userId, coverLetterId, role);

        Optional<Review> reviewOptional = reviewRepository.findById(reviewId);
        if (reviewOptional.isEmpty()) return;
        Review review = reviewOptional.get();

        validateReviewBelongsToQnA(review, qnAId);
        validateIsReviewOwnerOrQnAOwner(userId, review, qnA);

        // flush: 최신 answer 확보
        textDeltaService.flushToDb(qnAId);

        String currentAnswer = qnA.getAnswer() != null ? qnA.getAnswer() : "";
        String marker = markerOpen(reviewId) + review.getOriginText() + MARKER_CLOSE;

        if (currentAnswer.contains(marker)) {
            String unwrapped = currentAnswer.replace(marker, review.getOriginText());
            qnA.editAnswer(unwrapped);
            long newVersion = qnARepository.incrementVersion(qnAId, 1);
            textDeltaService.resetDeltaVersion(qnAId, newVersion);
            eventPublisher.publishEvent(new TextReplaceAllEvent(coverLetterId, qnAId, newVersion, unwrapped));
        } else {
            log.warn("리뷰 마커를 찾을 수 없음, 텍스트 변경 없이 삭제 진행: qnAId={}, reviewId={}", qnAId, reviewId);
        }

        reviewRepository.delete(review);
        eventPublisher.publishEvent(new ReviewDeleteEvent(coverLetterId, qnAId, reviewId));
    }

    private void validateIsReviewOwnerOrQnAOwner(String userId, Review review, QnA qnA) {
        if (!review.isOwner(userId) && !qnA.isOwner(userId)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    @Transactional
    public void approveReview(String userId, Long qnAId, Long reviewId) {
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        Long coverLetterId = qnA.getCoverLetter().getId();
        validateWebSocketConnected(userId, coverLetterId, ReviewRoleType.WRITER);

        Review review = reviewRepository.findByIdOrElseThrow(reviewId);
        validateReviewBelongsToQnA(review, qnAId);
        validateIsQnAOwner(userId, qnA);

        // flush: 최신 answer 확보
        textDeltaService.flushToDb(qnAId);

        if (review.isApproved()) {
            review.restore();
        } else {
            review.approve();
        }

        String currentAnswer = qnA.getAnswer() != null ? qnA.getAnswer() : "";
        String oldMarkerContent = markerOpen(reviewId) + review.getSuggest() + MARKER_CLOSE;

        if (currentAnswer.contains(oldMarkerContent)) {
            String newMarkerContent = markerOpen(reviewId) + review.getOriginText() + MARKER_CLOSE;
            String newAnswer = currentAnswer.replace(oldMarkerContent, newMarkerContent);
            qnA.editAnswer(newAnswer);
            long newVersion = qnARepository.incrementVersion(qnAId, 1);
            textDeltaService.resetDeltaVersion(qnAId, newVersion);
            eventPublisher.publishEvent(new TextReplaceAllEvent(coverLetterId, qnAId, newVersion, newAnswer));
        } else {
            log.warn("리뷰 마커를 찾을 수 없음, 상태 토글만 진행: qnAId={}, reviewId={}", qnAId, reviewId);
        }

        reviewRepository.save(review);
        eventPublisher.publishEvent(ReviewEditEvent.of(coverLetterId, qnAId, review));
    }

    private void validateWebSocketConnected(String userId, Long coverLetterId, ReviewRoleType role) {
        if (!shareLinkSessionRegistry.isConnectedUserInCoverLetter(userId, coverLetterId, role)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    private void validateIsQnAOwner(String userId, QnA qnA) {
        if (!qnA.isOwner(userId)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    @Transactional(readOnly = true)
    public ReviewsGetResponse getAllReviews(String userId, Long qnAId) {
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        Long coverLetterId = qnA.getCoverLetter().getId();
        ReviewRoleType role = qnA.determineReviewRole(userId);
        validateWebSocketConnected(userId, coverLetterId, role);

        if (role == ReviewRoleType.WRITER) {
            return getReviewsForWriter(qnAId);
        }
        return getReviewsForReviewer(qnAId, userId);
    }

    // Writer는 모든 첨삭 댓글을 볼 수 있다.
    private ReviewsGetResponse getReviewsForWriter(Long qnAId) {
        List<Review> reviews = reviewRepository.findAllByQnaId(qnAId);

        Set<String> reviewerIds = reviews.stream()
                .map(Review::getReviewerId)
                .collect(Collectors.toSet());

        Map<String, User> reviewerMap = userRepository.findAllByIdIn(reviewerIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        List<ReviewsGetResponse.ReviewResponse> reviewResponses = reviews.stream()
                .filter(review -> reviewerMap.containsKey(review.getReviewerId()))
                .map(review -> {
                    User reviewer = reviewerMap.get(review.getReviewerId());
                    return ReviewsGetResponse.ReviewResponse.from(review, reviewer);
                })
                .toList();

        return new ReviewsGetResponse(reviewResponses);
    }

    // Reviewer는 자신이 작성한 첨삭 댓글만을 볼 수 있다.
    private ReviewsGetResponse getReviewsForReviewer(Long qnAId, String reviewerId) {
        User reviewer = userRepository.findByIdOrElseThrow(reviewerId);
        List<Review> reviews = reviewRepository.findAllByQnaIdAndReviewerId(qnAId, reviewerId);

        List<ReviewsGetResponse.ReviewResponse> reviewResponses = reviews.stream()
                .map(review -> ReviewsGetResponse.ReviewResponse.from(review, reviewer))
                .toList();

        return new ReviewsGetResponse(reviewResponses);
    }

    private static String markerOpen(Long reviewId) {
        return "⟦r:" + reviewId + "⟧";
    }
}