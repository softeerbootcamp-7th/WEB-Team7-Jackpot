package com.jackpot.narratix.global.websocket;

import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class WebSocketSessionAttributes {

    // 세션 속성 키 상수
    private static final String USER_ID = "userId";
    private static final String SHARE_ID = "shareId";
    private static final String ROLE = "role";

    public static void setUserId(Map<String, Object> attributes, String userId) {
        attributes.put(USER_ID, userId);
    }

    public static String getUserId(Map<String, Object> attributes) {
        if (attributes == null) return null;
        Object value = attributes.get(USER_ID);
        return value != null ? value.toString() : null;
    }

    public static void setShareId(Map<String, Object> attributes, String shareId) {
        attributes.put(SHARE_ID, shareId);
    }

    public static String getShareId(Map<String, Object> attributes) {
        if (attributes == null) return null;
        Object value = attributes.get(SHARE_ID);
        return value != null ? value.toString() : null;
    }

    public static void setRole(Map<String, Object> attributes, ReviewRoleType role) {
        attributes.put(ROLE, role);
    }


    public static ReviewRoleType getRole(Map<String, Object> attributes) {
        if (attributes == null) return null;
        Object value = attributes.get(ROLE);
        
        if (value instanceof ReviewRoleType type) {
            return type;
        }

        return null;
    }

    public static boolean isValid(Map<String, Object> attributes) {
        if (attributes == null) {
            log.warn("WebSocket session attributes is null");
            return false;
        }

        String userId = getUserId(attributes);
        String shareId = getShareId(attributes);
        ReviewRoleType role = getRole(attributes);

        boolean isValid = userId != null && shareId != null && role != null;

        if (!isValid) {
            log.warn("WebSocket session validation failed: userId={}, shareId={}, role={}",
                     userId != null ? "present" : "null",
                     shareId != null ? "present" : "null",
                     role != null ? role : "null");
        }

        return isValid;
    }
}
