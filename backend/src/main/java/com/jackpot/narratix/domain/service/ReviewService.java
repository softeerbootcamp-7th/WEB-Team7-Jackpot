package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.domain.entity.notification_meta.FeedbackNotificationMeta;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ReviewRepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.domain.service.dto.NotificationSendRequest;
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
}
