package com.jackpot.narratix.domain.entity.notification_meta;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackNotificationMeta implements NotificationMeta {

    private Sender sender;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Sender {
        private String id;
        private String nickname;
    }
}
