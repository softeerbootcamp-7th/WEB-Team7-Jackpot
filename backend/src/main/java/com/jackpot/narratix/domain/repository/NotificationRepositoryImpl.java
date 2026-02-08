package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.Notification;
import com.jackpot.narratix.domain.exception.NotificationErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class NotificationRepositoryImpl implements NotificationRepository {

    private final NotificationJpaRepository notificationJpaRepository;

    @Override
    public Slice<Notification> findAllByUserId(String userId, Long lastNotificationId, Integer limit) {
        Pageable pageable = PageRequest.ofSize(limit);
        return notificationJpaRepository.findAllByUserIdAfterCursor(userId, lastNotificationId, pageable);
    }

    @Override
    public Slice<Notification> findRecentByUserId(String userId, Integer limit) {
        Pageable pageable = PageRequest.ofSize(limit);
        return notificationJpaRepository.findRecentByUserId(userId, pageable);
    }

    @Override
    public Notification findByIdOrElseThrow(Long notificationId) {
        return notificationJpaRepository.findById(notificationId)
                .orElseThrow(() -> new BaseException(NotificationErrorCode.NOTIFICATION_NOT_FOUND));
    }
}
