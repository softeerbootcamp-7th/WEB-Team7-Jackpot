package com.jackpot.narratix.global.websocket;

import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.WebSocketErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class WebSocketSessionAttributes {

    private static final String USER_ID = "userId";
    private static final String SHARE_ID = "shareId";
    private static final String ROLE = "role";

    public static void setUserId(Map<String, Object> attributes, String userId) {
        attributes.put(USER_ID, userId);
    }

    public static String getUserId(Map<String, Object> attributes) {
        validateSession(attributes);
        Object value = attributes.get(USER_ID);

        if (value == null) {
            log.warn("WebSocket session userId is null");
            throw new BaseException(WebSocketErrorCode.USER_ID_NOT_FOUND);
        }

        return value.toString();
    }

    public static void setShareId(Map<String, Object> attributes, String shareId) {
        attributes.put(SHARE_ID, shareId);
    }

    public static String getShareId(Map<String, Object> attributes) {
        validateSession(attributes);
        Object value = attributes.get(SHARE_ID);

        if (value == null) {
            log.warn("WebSocket session shareId is null");
            throw new BaseException(WebSocketErrorCode.SHARE_ID_NOT_FOUND);
        }

        return value.toString();
    }

    public static void setRole(Map<String, Object> attributes, ReviewRoleType role) {
        attributes.put(ROLE, role);
    }


    public static ReviewRoleType getRole(Map<String, Object> attributes) {
        validateSession(attributes);
        Object role = attributes.get(ROLE);

        if (role == null) {
            log.warn("WebSocket session role is null");
            throw new BaseException(WebSocketErrorCode.ROLE_NOT_FOUND);
        }

        if (role instanceof ReviewRoleType type) {
            return type;
        } else {
            log.warn("WebSocket session role is not ReviewRoleType");
            throw new BaseException(WebSocketErrorCode.ROLE_NOT_FOUND);
        }
    }

    private static void validateSession(Map<String, Object> attributes) {
        if (attributes == null) {
            log.warn("WebSocket session attributes is null");
            throw new BaseException(WebSocketErrorCode.SESSION_ATTRIBUTES_NOT_FOUND);
        }
    }
}
