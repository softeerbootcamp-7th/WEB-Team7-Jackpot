package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.NotificationsPaginationResponse;
import com.jackpot.narratix.domain.controller.response.UnreadNotificationCountResponse;
import com.jackpot.narratix.domain.entity.Notification;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.domain.entity.notification_meta.FeedbackNotificationMeta;
import com.jackpot.narratix.domain.entity.notification_meta.LabelingNotificationMeta;
import com.jackpot.narratix.domain.event.NotificationSendEvent;
import com.jackpot.narratix.domain.repository.NotificationRepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.domain.service.dto.NotificationSendRequest;
import com.jackpot.narratix.domain.service.dto.NotificationSendResponse;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final String LABELING_NOTIFICATION_TITLE = "총 %d개의 자기소개서를 분석했어요";

    @Transactional(readOnly = true)
    public NotificationsPaginationResponse getNotificationsByUserId(
            String userId, Optional<Long> lastNotificationId, Integer size
    ) {
        Slice<Notification> notifications = lastNotificationId
                .map(notificationId -> notificationRepository.findAllByUserId(userId, notificationId, size))
                .orElseGet(() -> notificationRepository.findRecentByUserId(userId, size));

        return NotificationsPaginationResponse.of(notifications.getContent(), notifications.hasNext());
    }

    @Transactional
    public void markNotificationAsRead(String userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdOrElseThrow(notificationId);

        if (!notification.isOwner(userId)) throw new BaseException(GlobalErrorCode.FORBIDDEN);

        notification.read();
    }

    @Transactional
    public void markAllNotificationAsRead(String userId) {
        notificationRepository.updateAllNotificationAsReadByUserId(userId);
    }

    @Transactional(readOnly = true)
    public UnreadNotificationCountResponse countUnreadNotification(String userId) {
        long unreadNotificationCount = notificationRepository.countByUserIdAndIsRead(userId, false);
        return new UnreadNotificationCountResponse(unreadNotificationCount);
    }

    @Transactional
    public void sendFeedbackNotificationToWriter(
            String reviewerId,
            String writerId,
            String notificationTitle,
            Long coverLetterId,
            Long qnAId,
            String originText
    ) {
        User reviewer = userRepository.findByIdOrElseThrow(reviewerId);

        FeedbackNotificationMeta feedbackNotificationMeta = FeedbackNotificationMeta.of(
                reviewer.getId(), reviewer.getNickname(), coverLetterId, qnAId
        );

        NotificationSendRequest request = NotificationSendRequest.builder()
                .type(NotificationType.FEEDBACK)
                .meta(feedbackNotificationMeta)
                .title(notificationTitle)
                .content(originText)
                .build();

        Notification notification = request.toEntity(writerId);
        notificationRepository.save(notification);

        eventPublisher.publishEvent(new NotificationSendEvent(writerId, NotificationSendResponse.of(notification)));
    }

    @Transactional
    public void sendLabelingCompleteNotification(String userId, String jobId, long successCount, long failCount) {

        LabelingNotificationMeta labelingNotificationMeta = LabelingNotificationMeta.of(
                jobId, successCount, failCount
        );

        NotificationSendRequest request = NotificationSendRequest.builder()
                .type(NotificationType.LABELING_COMPLETE)
                .meta(labelingNotificationMeta)
                .title(LABELING_NOTIFICATION_TITLE.formatted(successCount + failCount))
                .content(null)
                .build();

        Notification notification = request.toEntity(userId);
        notificationRepository.save(notification);

        eventPublisher.publishEvent(new NotificationSendEvent(userId, NotificationSendResponse.of(notification)));
    }

}
