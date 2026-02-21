package com.jackpot.narratix.domain.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.domain.entity.notification_meta.NotificationMeta;
import com.jackpot.narratix.domain.entity.notification_meta.NotificationMetaConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Objects;

@Entity
@Table(
        name = "notification",
        indexes = @Index(name = "idx_user_id_created_at_desc", columnList = "user_id, created_at DESC")
)
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseTimeEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private String userId;

    @NotNull
    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(name = "title", nullable = true)
    private String title;

    @Column(name = "content", nullable = true)
    private String content;

    @NotNull
    @Builder.Default
    @JsonProperty("isRead")
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(columnDefinition = "json", name = "meta", nullable = true)
    private String metaJson;

    @Transient
    private NotificationMeta meta;

    @PostLoad
    private void deserializeMeta() {
        if (metaJson != null && !metaJson.isEmpty()) {
            this.meta = NotificationMetaConverter.deserialize(metaJson, type);
        }
    }

    @PrePersist
    @PreUpdate
    private void serializeMeta() {
        if (meta != null) {
            this.metaJson = NotificationMetaConverter.serialize(meta);
        }else {
            this.metaJson = null;
        }
    }

    public boolean isOwner(String userId) {
        return Objects.equals(this.userId, userId);
    }

    public void read() {
        this.isRead = true;
    }
}
