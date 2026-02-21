package com.jackpot.narratix.domain.fixture;

import com.jackpot.narratix.domain.entity.Notification;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.domain.entity.notification_meta.NotificationMeta;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static com.jackpot.narratix.domain.fixture.BaseTimeEntityFixture.setAuditFields;

public class NotificationFixture {

    public static NotificationFixtureBuilder builder() {
        return new NotificationFixtureBuilder();
    }

    public static class NotificationFixtureBuilder {
        private Long id;
        private String userId = "testUser";
        private NotificationType type = NotificationType.FEEDBACK;
        private String title = "테스트 알림";
        private String content = "테스트 내용";
        private boolean isRead = false;
        private String metaJson;
        private NotificationMeta meta;
        private LocalDateTime createdAt;
        private LocalDateTime modifiedAt;

        public NotificationFixtureBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public NotificationFixtureBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public NotificationFixtureBuilder type(NotificationType type) {
            this.type = type;
            return this;
        }

        public NotificationFixtureBuilder title(String title) {
            this.title = title;
            return this;
        }

        public NotificationFixtureBuilder content(String content) {
            this.content = content;
            return this;
        }

        public NotificationFixtureBuilder isRead(boolean isRead) {
            this.isRead = isRead;
            return this;
        }

        public NotificationFixtureBuilder metaJson(String metaJson) {
            this.metaJson = metaJson;
            return this;
        }

        public NotificationFixtureBuilder meta(NotificationMeta meta) {
            this.meta = meta;
            return this;
        }

        public NotificationFixtureBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public NotificationFixtureBuilder modifiedAt(LocalDateTime modifiedAt) {
            this.modifiedAt = modifiedAt;
            return this;
        }

        public Notification build() {
            Notification notification;
            try {
                var constructor = Notification.class.getDeclaredConstructor();
                constructor.setAccessible(true);
                notification = constructor.newInstance();
            } catch (Exception e) {
                throw new RuntimeException("Failed to create Notification instance", e);
            }

            if (id != null) {
                ReflectionTestUtils.setField(notification, "id", id);
            }
            ReflectionTestUtils.setField(notification, "userId", userId);
            ReflectionTestUtils.setField(notification, "type", type);
            ReflectionTestUtils.setField(notification, "title", title);
            ReflectionTestUtils.setField(notification, "content", content);
            ReflectionTestUtils.setField(notification, "isRead", isRead);

            if (metaJson != null) {
                ReflectionTestUtils.setField(notification, "metaJson", metaJson);
            }
            if (meta != null) {
                ReflectionTestUtils.setField(notification, "meta", meta);
            }

            if (createdAt != null && modifiedAt != null) {
                ReflectionTestUtils.setField(notification, "createdAt", createdAt);
                ReflectionTestUtils.setField(notification, "modifiedAt", modifiedAt);
            } else if (modifiedAt != null) {
                ReflectionTestUtils.setField(notification, "createdAt", modifiedAt);
                ReflectionTestUtils.setField(notification, "modifiedAt", modifiedAt);
            } else {
                setAuditFields(notification);
            }

            return notification;
        }
    }

    public static List<Notification> createMockNotifications(int count) {
        List<Notification> notifications = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Notification notification = NotificationFixture.builder()
                    .id((long) i)
                    .build();
            notifications.add(notification);
        }
        return notifications;
    }
}