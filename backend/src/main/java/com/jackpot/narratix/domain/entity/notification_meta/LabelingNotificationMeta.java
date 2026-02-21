package com.jackpot.narratix.domain.entity.notification_meta;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LabelingNotificationMeta implements NotificationMeta {

    private String jobId;
    private long successFileCount;
    private long failFileCount;

    public static LabelingNotificationMeta of(String jobId, long successFileCount, long failFileCount) {
        return new LabelingNotificationMeta(jobId, successFileCount, failFileCount);
    }
}

