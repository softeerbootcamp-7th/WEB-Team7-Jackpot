package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.response.NotificationsPaginationResponse;
import com.jackpot.narratix.domain.service.NotificationService;
import com.jackpot.narratix.global.auth.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notification")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/all")
    public ResponseEntity<NotificationsPaginationResponse> getNotifications(
            @UserId String userId,
            @RequestParam(required = false) Optional<Long> lastNotificationId,
            @RequestParam Integer size
    ) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId, lastNotificationId, size));
    }

}
