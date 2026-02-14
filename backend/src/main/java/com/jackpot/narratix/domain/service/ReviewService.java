package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.response.ReviewEditResponse;
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

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final QnARepository qnARepository;
    private final NotificationService notificationService;

    @Transactional
    public void createReview(String reviewerId, Long qnaId, ReviewCreateRequest request) {
        Review review = reviewRepository.save(request.toEntity(reviewerId, qnaId));

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
    public ReviewEditResponse editReview(String userId, Long qnAId, Long reviewId, ReviewEditRequest request) {

        Review review = reviewRepository.findByIdOrElseThrow(reviewId);

        validateReviewBelongsToQnA(review, qnAId);
        validateIsReviewOwner(userId, review);

        review.editSuggest(request.suggest());
        review.editComment(request.comment());
        review = reviewRepository.save(review);

        // TODO: 첨삭 댓글 수정 이벤트 수신

        return new ReviewEditResponse(review.getModifiedAt());
    }

    private void validateReviewBelongsToQnA(Review review, Long qnAId) {
        if(!review.belongsToQnA(qnAId)) throw new BaseException(ReviewErrorCode.REVIEW_NOT_BELONGS_TO_QNA);
    }

    private void validateIsReviewOwner(String userId, Review review) {
        if (!review.isOwner(userId)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }
}
