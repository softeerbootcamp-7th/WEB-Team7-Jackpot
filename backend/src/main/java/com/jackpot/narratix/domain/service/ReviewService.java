package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
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

import java.util.Optional;

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

        sendFeedbackNotificationToWriter(reviewerId, qnaId, request.originText());
    }

    private void sendFeedbackNotificationToWriter(String reviewerId, Long qnAId, String originText) {
        User reviewer = userRepository.findByIdOrElseThrow(reviewerId);
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);
        CoverLetter coverLetter = qnA.getCoverLetter();
        String writerId = coverLetter.getUserId();

        FeedbackNotificationMeta feedbackNotificationMeta = FeedbackNotificationMeta.of(
                reviewer.getId(), reviewer.getNickname(), qnAId
        );

        NotificationSendRequest notificationSendRequest = NotificationSendRequest.builder()
                .type(NotificationType.FEEDBACK)
                .meta(feedbackNotificationMeta)
                .title(coverLetter.getCompanyName() + " " + coverLetter.getApplyYear() + " " + coverLetter.getApplyHalf().getDescription())
                .content(originText)
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
        if(!review.belongsToQnA(qnAId)) throw new BaseException(ReviewErrorCode.REVIEW_NOT_BELONGS_TO_QNA);
    }

    private void validateIsReviewOwner(String userId, Review review) {
        if (!review.isOwner(userId)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    @Transactional
    public void deleteReview(String userId, Long qnAId, Long reviewId) {

        Optional<Review> reviewOptional = reviewRepository.findById(reviewId);
        if(reviewOptional.isEmpty()) return;
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
}
