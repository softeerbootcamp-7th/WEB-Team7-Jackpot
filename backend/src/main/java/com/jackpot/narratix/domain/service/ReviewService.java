package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.response.ReviewsGetResponse;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.ReviewErrorCode;
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
        String oldMarker = markerOpen(reviewId) + oldContent + MARKER_CLOSE;
        String newMarker = markerOpen(reviewId) + newContent + MARKER_CLOSE;
        return currentAnswer.replace(oldMarker, newMarker);
    }

    public boolean containsMarker(String answer, Long reviewId, String content) {
        String marker = markerOpen(reviewId) + content + MARKER_CLOSE;
        return answer.contains(marker);
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

    public void validateOriginText(String originText, String currentAnswer, int start, int end) {
        String textAtRange = currentAnswer.substring(start, end);
        if (!textAtRange.equals(originText)) {
            throw new BaseException(ReviewErrorCode.REVIEW_TEXT_MISMATCH);
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