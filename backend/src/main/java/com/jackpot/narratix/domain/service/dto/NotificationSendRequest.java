package com.jackpot.narratix.domain.service.dto;

import com.jackpot.narratix.domain.entity.Notification;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.domain.entity.notification_meta.NotificationMeta;
import lombok.Builder;

@Builder
public record NotificationSendRequest(
        NotificationType type,
        String title,
        String content,
        NotificationMeta meta
) {
    public Notification toEntity(String receiverId) {
        return Notification.builder()
                .userId(receiverId)
                .type(type)
                .title(title)
                .content(content)
                .meta(meta)
                .isRead(false)
                .build();
    }
}
