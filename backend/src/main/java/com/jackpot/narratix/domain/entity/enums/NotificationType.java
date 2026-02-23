package com.jackpot.narratix.domain.entity.enums;

import com.jackpot.narratix.domain.entity.notification_meta.FeedbackNotificationMeta;
import com.jackpot.narratix.domain.entity.notification_meta.LabelingNotificationMeta;
import com.jackpot.narratix.domain.entity.notification_meta.NotificationMeta;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum NotificationType {

    FEEDBACK(FeedbackNotificationMeta.class),
    LABELING_COMPLETE(LabelingNotificationMeta.class);

    private final Class<? extends NotificationMeta> metaClass;
}
