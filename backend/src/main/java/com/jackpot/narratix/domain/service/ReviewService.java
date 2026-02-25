package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.response.ReviewsGetResponse;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.ReviewErrorCode;
import com.jackpot.narratix.domain.exception.ReviewSyncRequiredException;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ReviewRepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    public static final String MARKER_CLOSE = "⟦/r⟧";

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final QnARepository qnARepository;
    private final ShareLinkSessionRegistry shareLinkSessionRegistry;

    @Transactional
    public Review createReview(String reviewerId, Long qnAId, ReviewCreateRequest request) {
        return reviewRepository.save(request.toEntity(reviewerId, qnAId));
    }

    @Transactional
    public Review editReview(String userId, Long qnAId, Long reviewId, ReviewEditRequest request) {
        Long coverLetterId = qnARepository.getCoverLetterIdByQnAIdOrElseThrow(qnAId);
        validateWebSocketConnected(userId, coverLetterId, ReviewRoleType.REVIEWER);
        Review review = reviewRepository.findByIdOrElseThrow(reviewId);

        validateReviewBelongsToQnA(review, qnAId);
        validateIsReviewOwner(userId, review);

        review.editSuggest(request.suggest());
        review.editComment(request.comment());
        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    @Transactional(readOnly = true)
    public Review getReview(Long reviewId) {
        return reviewRepository.findByIdOrElseThrow(reviewId);
    }

    @Transactional
    public void toggleApproval(Review review) {
        if (review.isApproved()) {
            review.restore();
        } else {
            review.approve();
        }
        reviewRepository.save(review);
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

    @Transactional(readOnly = true)
    public Optional<Review> findById(Long reviewId) {
        return reviewRepository.findById(reviewId);
    }

    // ======================== 리뷰 마커 관련 ========================

    public String addMarkerToReviewedSection(
            String currentAnswer, int start, int end, Long reviewId, String originText
    ) {
        return currentAnswer.substring(0, start)
                + markerOpen(reviewId) + originText + MARKER_CLOSE
                + currentAnswer.substring(end);
    }

    public String removeReviewMarker(String currentAnswer, Long reviewId) {
        String markerOpen = markerOpen(reviewId);
        int markerOpenIndex = currentAnswer.indexOf(markerOpen);

        if (markerOpenIndex == -1) {
            // 마커가 없으면 원본 반환
            return currentAnswer;
        }

        int contentStartIndex = markerOpenIndex + markerOpen.length();
        int markerCloseIndex = currentAnswer.indexOf(MARKER_CLOSE, contentStartIndex);

        if (markerCloseIndex == -1) {
            // MARKER_CLOSE가 없으면 markerOpen만이라도 제거
            String content = currentAnswer.substring(contentStartIndex);
            return currentAnswer.substring(0, markerOpenIndex) + content;
        }

        String content = currentAnswer.substring(contentStartIndex, markerCloseIndex);

        // markerOpen과 MARKER_CLOSE 제거
        return currentAnswer.substring(0, markerOpenIndex)
                + content
                + currentAnswer.substring(markerCloseIndex + MARKER_CLOSE.length());
    }

    public String replaceMarkerContent(String currentAnswer, Long reviewId, String oldContent, String newContent) {
        String content = getContentInMarker(currentAnswer, reviewId);

        if (!content.equals(oldContent)) {
            // 마커 내부 내용이 oldContent와 다르면 오류 발생
            log.warn("마커 내부 내용이 일치하지 않습니다. reviewId={}, expected={}, actual={}", reviewId, oldContent, content);
            throw new BaseException(ReviewErrorCode.REVIEW_MARKER_CONTENT_MISMATCH);
        }

        String oldMarker = markerOpen(reviewId) + oldContent + MARKER_CLOSE;
        String newMarker = markerOpen(reviewId) + newContent + MARKER_CLOSE;
        return currentAnswer.replace(oldMarker, newMarker);
    }

    private String getContentInMarker(String currentAnswer, Long reviewId) {
        String markerOpen = markerOpen(reviewId);
        int markerOpenIndex = currentAnswer.indexOf(markerOpen);

        if (markerOpenIndex == -1) {
            log.warn("리뷰 OPEN 마커가 본문에서 발견되지 않았습니다. reviewId={}, currentAnswer={}", reviewId, currentAnswer);
            throw new BaseException(ReviewErrorCode.REVIEW_OPEN_MARKER_NOT_FOUND);
        }

        int contentStartIndex = markerOpenIndex + markerOpen.length();
        int markerCloseIndex = currentAnswer.indexOf(MARKER_CLOSE, contentStartIndex);

        if (markerCloseIndex == -1) {
            log.warn("리뷰 CLOSE 마커가 본문에서 발견되지 않았습니다. reviewId={}, currentAnswer={}", reviewId, currentAnswer);
            throw new BaseException(ReviewErrorCode.REVIEW_CLOSE_MARKER_NOT_FOUND);
        }

        return currentAnswer.substring(contentStartIndex, markerCloseIndex);
    }

    // ======================== 검증 메서드 ========================

    public void validateReviewBelongsToQnA(Review review, Long qnAId) {
        if (!review.belongsToQnA(qnAId)) {
            throw new BaseException(ReviewErrorCode.REVIEW_NOT_BELONGS_TO_QNA);
        }
    }

    public void validateIsReviewOwner(String userId, Review review) {
        if (!review.isOwner(userId)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    public void validateIsReviewOwnerOrQnAOwner(String userId, Review review, QnA qnA) {
        if (!review.isOwner(userId) && !qnA.isOwner(userId)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    public void validateIsQnAOwner(String userId, QnA qnA) {
        if (!qnA.isOwner(userId)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    public void validateWebSocketConnected(String userId, Long coverLetterId, ReviewRoleType role) {
        if (!shareLinkSessionRegistry.isConnectedUserInCoverLetter(userId, coverLetterId, role)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    public void validateOriginText(String originText, String currentAnswer, int start, int end, Long qnAId) {
        // 인덱스 범위 유효성 검증
        if (start < 0 || start > end || end > currentAnswer.length()) {
            log.warn("리뷰 범위가 유효하지 않습니다. qnAId={}, currentAnswerLength={}, start={}, end={}",
                    qnAId, currentAnswer.length(), start, end);
            throw new ReviewSyncRequiredException(ReviewErrorCode.REVIEW_TEXT_MISMATCH, qnAId);
        }

        // substring 실행 및 텍스트 일치 검증
        try {
            String textAtRange = currentAnswer.substring(start, end);
            if (!textAtRange.equals(originText)) {
                log.warn("리뷰 대상 텍스트가 현재 텍스트와 일치하지 않습니다. qnAId={}, expected={}, actual={}, currentAnswer={}, start={}, end={}",
                        qnAId, originText, textAtRange, currentAnswer, start, end);
                throw new ReviewSyncRequiredException(ReviewErrorCode.REVIEW_TEXT_MISMATCH, qnAId);
            }
        } catch (StringIndexOutOfBoundsException e) {
            // 예상치 못한 substring 에러 (위의 검증을 통과했지만 발생한 경우)
            log.error("예상치 못한 substring 에러 발생. qnAId={}, currentAnswerLength={}, start={}, end={}",
                    qnAId, currentAnswer.length(), start, end, e);
            throw new ReviewSyncRequiredException(ReviewErrorCode.REVIEW_TEXT_MISMATCH, qnAId);
        }
    }

    // ======================== Private 메서드 ========================

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

    private ReviewsGetResponse getReviewsForReviewer(Long qnAId, String reviewerId) {
        User reviewer = userRepository.findByIdOrElseThrow(reviewerId);
        List<Review> reviews = reviewRepository.findAllByQnaIdAndReviewerId(qnAId, reviewerId);

        List<ReviewsGetResponse.ReviewResponse> reviewResponses = reviews.stream()
                .map(review -> ReviewsGetResponse.ReviewResponse.from(review, reviewer))
                .toList();

        return new ReviewsGetResponse(reviewResponses);
    }

    public static String markerOpen(Long reviewId) {
        return "⟦r:" + reviewId + "⟧";
    }
}