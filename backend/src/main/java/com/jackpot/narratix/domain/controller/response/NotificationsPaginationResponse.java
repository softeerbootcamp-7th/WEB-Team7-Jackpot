package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.Notification;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.domain.entity.notification_meta.NotificationMeta;

import java.time.LocalDateTime;
import java.util.List;

public record NotificationsPaginationResponse(
        List<NotificationsResponse> notifications,
        Boolean hasNext
) {

    public static NotificationsPaginationResponse of(List<Notification> notifications, Boolean hasNext) {
        return new NotificationsPaginationResponse(
                notifications.stream()
                        .map(NotificationsResponse::of)
                        .toList(),
                hasNext
        );
    }

    public record NotificationsResponse(
            Long id,
            NotificationType type,
            String title,
            String content,
            boolean isRead,
            LocalDateTime createdAt,
            NotificationMeta meta
    ) {

        private static NotificationsResponse of(Notification notification) {
            return new NotificationsResponse(
                    notification.getId(),
                    notification.getType(),
                    notification.getTitle(),
                    notification.getContent(),
                    notification.isRead(),
                    notification.getCreatedAt(),
                    notification.getMeta()
            );
        }
    }
}
