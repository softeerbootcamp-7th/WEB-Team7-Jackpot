package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.NotificationsPaginationResponse;
import com.jackpot.narratix.domain.entity.Notification;
import com.jackpot.narratix.domain.repository.NotificationRepository;
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
}
