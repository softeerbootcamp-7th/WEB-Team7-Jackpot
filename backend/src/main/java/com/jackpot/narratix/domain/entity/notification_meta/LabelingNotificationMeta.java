package com.jackpot.narratix.domain.entity.notification_meta;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LabelingNotificationMeta implements NotificationMeta {

    private List<CoverLetterMeta> coverLetters;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverLetterMeta {
        private Long coverLetterId;
        private List<Long> questionIds;
    }
}

