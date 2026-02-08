package com.jackpot.narratix.domain.entity.notification_meta;

import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class NotificationMetaConverter {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String serialize(NotificationMeta meta) {
        if (meta == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(meta);
        } catch (JacksonException e) {
            log.error("Failed to serialize NotificationMeta: {}", meta.getClass().getSimpleName(), e);
            throw new BaseException(GlobalErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }

    public static NotificationMeta deserialize(String json, NotificationType type) {
        if (json == null || json.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(json, type.getMetaClass());
        } catch (JacksonException e) {
            log.error("Failed to deserialize NotificationMeta for type: {}. JSON: {}", type, json, e);
            throw new BaseException(GlobalErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }
}