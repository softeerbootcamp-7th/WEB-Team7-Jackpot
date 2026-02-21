package com.jackpot.narratix.domain.event;

import com.jackpot.narratix.domain.service.dto.NotificationSendResponse;

public record NotificationSendEvent(String receiverId, NotificationSendResponse notificationSendResponse) {

}