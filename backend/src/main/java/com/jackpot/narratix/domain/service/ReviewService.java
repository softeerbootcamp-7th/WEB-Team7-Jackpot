package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.response.ReviewsGetResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.event.ReviewDeleteEvent;
import com.jackpot.narratix.domain.event.ReviewEditEvent;
import com.jackpot.narratix.domain.exception.ReviewErrorCode;
import com.jackpot.narratix.domain.event.ReviewCreatedEvent;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ReviewRepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final QnARepository qnARepository;

    @Transactional
    public void createReview(String reviewerId, Long qnAId, ReviewCreateRequest request) {

        // TODO: 버전과 비교해서 리뷰를 달 수 있는지 확인

        Review review = reviewRepository.save(request.toEntity(reviewerId, qnAId));
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);

        // TODO: 본문 텍스트 전체 변경 이벤트 발행

        Long coverLetterId = qnA.getCoverLetter().getId();
        eventPublisher.publishEvent(ReviewCreatedEvent.of(coverLetterId, qnAId, review));
        CoverLetter coverLetter = qnA.getCoverLetter();
        notificationService.sendFeedbackNotificationToWriter(reviewerId, coverLetter, qnAId, request.originText());
    }

    @Transactional
    public void editReview(String userId, Long qnAId, Long reviewId, ReviewEditRequest request) {
        Review review = reviewRepository.findByIdOrElseThrow(reviewId);

        validateReviewBelongsToQnA(review, qnAId);
        validateIsReviewOwner(userId, review);

        review.editSuggest(request.suggest());
        review.editComment(request.comment());
        Review updatedReview = reviewRepository.save(review);

        Long coverLetterId = qnARepository.getCoverLetterIdByQnAId(qnAId);
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

        Optional<Review> reviewOptional = reviewRepository.findById(reviewId);
        if (reviewOptional.isEmpty()) return;
        Review review = reviewOptional.get();

        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);

        validateReviewBelongsToQnA(review, qnAId);
        validateIsReviewOwnerOrQnAOwner(userId, review, qnA);

        reviewRepository.delete(review);

        // TODO: Writer, Reviewer 본문 텍스트 전체 변경 이벤트 발송

        Long coverLetterId = qnARepository.getCoverLetterIdByQnAId(qnAId);
        eventPublisher.publishEvent(new ReviewDeleteEvent(coverLetterId, qnAId, reviewId));
    }

    private void validateIsReviewOwnerOrQnAOwner(String userId, Review review, QnA qnA) {
        if (!review.isOwner(userId) && !qnA.isOwner(userId)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    @Transactional
    public void approveReview(String userId, Long qnAId, Long reviewId) {
        Review review = reviewRepository.findByIdOrElseThrow(reviewId);
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);

        validateReviewBelongsToQnA(review, qnAId);
        validateIsQnAOwner(userId, qnA);

        // TODO: Redis에서 최신 버전 가져오기
        // TODO: 최신 버전에서 첨삭 댓글 확인 및 originText와 같은지 비교

        if (review.isApproved()) {
            review.restore();
        } else {
            review.approve();
        }
        Review updatedReview = reviewRepository.save(review);

        // TODO: 웹소켓 본문 텍스트 변경 이벤트 발송

        Long coverLetterId = qnARepository.getCoverLetterIdByQnAId(qnAId);
        eventPublisher.publishEvent(ReviewEditEvent.of(coverLetterId, qnAId, updatedReview));
    }

    private void validateIsQnAOwner(String userId, QnA qnA) {
        if (!qnA.isOwner(userId)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    @Transactional(readOnly = true)
    public ReviewsGetResponse getAllReviews(String userId, Long qnAId) {
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        ReviewRoleType role = qnA.determineReviewRole(userId);

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
}
