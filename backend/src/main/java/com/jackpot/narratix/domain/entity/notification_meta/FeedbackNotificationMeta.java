package com.jackpot.narratix.domain.entity.notification_meta;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackNotificationMeta implements NotificationMeta {

    private Sender sender;
    private Long coverLetterId;
    private Long qnAId;

    public static FeedbackNotificationMeta of(String reviewerId, String senderNickname, Long coverLetterId, Long qnaId){
        return new FeedbackNotificationMeta(new Sender(reviewerId, senderNickname), coverLetterId, qnaId);
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Sender {
        private String id;
        private String nickname;
    }
}
