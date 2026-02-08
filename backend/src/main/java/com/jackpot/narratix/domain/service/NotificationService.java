package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.UnreadNotificationCountResponse;
import com.jackpot.narratix.domain.controller.response.NotificationsPaginationResponse;
import com.jackpot.narratix.domain.entity.Notification;
import com.jackpot.narratix.domain.repository.NotificationRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public NotificationsPaginationResponse getNotificationsByUserId(
            String userId, Optional<Long> lastNotificationId, Integer size
    ) {
        int fetchLimit = size + 1;

        Slice<Notification> notifications = lastNotificationId
                .map(notificationId -> notificationRepository.findAllByUserId(userId, notificationId, fetchLimit))
                .orElseGet(() -> notificationRepository.findRecentByUserId(userId, fetchLimit));

        List<NotificationsPaginationResponse.NotificationsResponse> notificationsResponses = notifications.stream()
                .limit(size)
                .map(NotificationsPaginationResponse.NotificationsResponse::of)
                .toList();

        return new NotificationsPaginationResponse(notificationsResponses, notifications.hasNext());
    }

    @Transactional
    public void markNotificationAsRead(String userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdOrElseThrow(notificationId);

        if(!notification.isOwner(userId)) throw new BaseException(GlobalErrorCode.FORBIDDEN);

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
}
