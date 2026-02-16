package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.response.ReviewsGetResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.entity.notification_meta.FeedbackNotificationMeta;
import com.jackpot.narratix.domain.exception.ReviewErrorCode;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ReviewRepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.domain.service.dto.NotificationSendRequest;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
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

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final QnARepository qnARepository;
    private final NotificationService notificationService;

    @Transactional
    public void createReview(String reviewerId, Long qnaId, ReviewCreateRequest request) {
        reviewRepository.save(request.toEntity(reviewerId, qnaId));

        // TODO: 본문 텍스트 전체 변경 이벤트 발행

        // TODO: 첨삭 댓글 생성 이벤트 발행

        sendFeedbackNotificationToWriter(reviewerId, qnaId);
    }

    private void sendFeedbackNotificationToWriter(String reviewerId, Long qnaId) {
        User reviewer = userRepository.findByIdOrElseThrow(reviewerId);
        QnA qnA = qnARepository.findByIdOrElseThrow(qnaId);
        CoverLetter coverLetter = qnA.getCoverLetter();
        String writerId = coverLetter.getUserId();

        FeedbackNotificationMeta feedbackNotificationMeta = FeedbackNotificationMeta.of(
                reviewer.getId(), reviewer.getNickname(), qnA.getId()
        );

        NotificationSendRequest notificationSendRequest = NotificationSendRequest.builder()
                .type(NotificationType.FEEDBACK)
                .meta(feedbackNotificationMeta)
                .title(coverLetter.getCompanyName() + " " + coverLetter.getApplyYear() + " " + coverLetter.getApplyHalf().getDescription())
                .content(qnA.getAnswer())
                .build();

        notificationService.sendNotification(writerId, notificationSendRequest);
    }

    @Transactional
    public void editReview(String userId, Long qnAId, Long reviewId, ReviewEditRequest request) {

        Review review = reviewRepository.findByIdOrElseThrow(reviewId);

        validateReviewBelongsToQnA(review, qnAId);
        validateIsReviewOwner(userId, review);

        review.editSuggest(request.suggest());
        review.editComment(request.comment());
        reviewRepository.save(review);

        // TODO: 첨삭 댓글 수정 이벤트 수신
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
        // TODO: Writer, Reviewer 첨삭 댓글 수정 이벤트 발송
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

        // TODO: 웹소켓 본문 전체 텍스트 변경 이벤트 발송
        // TODO: 첨삭 댓글 수정 이벤트 발송
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
