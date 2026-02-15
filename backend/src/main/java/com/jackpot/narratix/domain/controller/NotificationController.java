package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.api.NotificationApi;
import com.jackpot.narratix.domain.controller.response.NotificationsPaginationResponse;
import com.jackpot.narratix.domain.controller.response.UnreadNotificationCountResponse;
import com.jackpot.narratix.domain.service.NotificationService;
import com.jackpot.narratix.global.auth.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notification")
public class NotificationController implements NotificationApi {

    private final NotificationService notificationService;

    @Override
    @GetMapping("/all")
    public ResponseEntity<NotificationsPaginationResponse> getNotifications(
            @UserId String userId,
            @RequestParam(required = false) Optional<Long> lastNotificationId,
            @RequestParam Integer size
    ) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId, lastNotificationId, size));
    }

    @Override
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(
            @UserId String userId,
            @PathVariable Long notificationId
    ) {
        notificationService.markNotificationAsRead(userId, notificationId);
        return ResponseEntity.noContent().build();
    }

    @Override
    @PatchMapping("/all/read")
    public ResponseEntity<Void> markAllNotificationAsRead(
            @UserId String userId
    ) {
        notificationService.markAllNotificationAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @Override
    @GetMapping("/count")
    public ResponseEntity<UnreadNotificationCountResponse> getUnreadNotificationCount(
            @UserId String userId
    ) {
        return ResponseEntity.ok(notificationService.countUnreadNotification(userId));
    }
}
