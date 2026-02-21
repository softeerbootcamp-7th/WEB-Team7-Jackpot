package com.jackpot.narratix.domain.service.dto;

import com.jackpot.narratix.domain.entity.Notification;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.domain.entity.notification_meta.NotificationMeta;

import java.time.LocalDateTime;

public record NotificationSendResponse(
        Long id,
        NotificationType type,
        String title,
        String content,
        boolean isRead,
        LocalDateTime createdAt,
        NotificationMeta meta
) {

    public static NotificationSendResponse of(Notification notification){
        return new NotificationSendResponse(
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
