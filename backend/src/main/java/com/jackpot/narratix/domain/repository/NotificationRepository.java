package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.Notification;
import org.springframework.data.domain.Slice;

public interface NotificationRepository {

    Slice<Notification> findAllByUserId(String userId, Long lastNotificationId, Integer limit);

    Slice<Notification> findRecentByUserId(String userId, Integer limit);

    Notification findByIdOrElseThrow(Long notificationId);
}
