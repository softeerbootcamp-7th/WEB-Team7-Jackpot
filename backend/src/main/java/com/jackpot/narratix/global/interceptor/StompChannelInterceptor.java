package com.jackpot.narratix.global.interceptor;

import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.ShareLinkErrorCode;
import com.jackpot.narratix.domain.service.ShareLinkService;
import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.service.JwtTokenParser;
import com.jackpot.narratix.global.auth.jwt.service.JwtValidator;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.websocket.WebSocketSessionAttributes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Objects;

import static org.springframework.messaging.support.MessageHeaderAccessor.getAccessor;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompChannelInterceptor implements ChannelInterceptor {

    private final JwtValidator jwtValidator;
    private final JwtTokenParser jwtTokenParser;
    private final ShareLinkService shareLinkService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(Objects.requireNonNull(accessor).getCommand())) {
            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
            if (sessionAttributes == null) {
                throw new IllegalStateException("Session attributes cannot be null during CONNECT");
            }

            String shareId = getShareId(accessor);
            String userId = extractUserId(accessor);
            ReviewRoleType role = shareLinkService.validateShareLinkAndGetRole(userId, shareId);

            if (!shareLinkService.accessShareLink(userId, role, shareId)) {
                log.warn("Share link access denied: userId={}, shareId={}, role={}", userId, shareId, role);
                throw new BaseException(ShareLinkErrorCode.SHARE_LINK_ACCESS_LIMIT_EXCEEDED);
            }

            WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
            WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
            WebSocketSessionAttributes.setRole(sessionAttributes, role);

            log.info("WebSocket CONNECT: userId={}, shareId={}, role={}", userId, shareId, role);
        }

        return message;
    }

    private String getShareId(StompHeaderAccessor accessor) {
        String shareId = accessor.getFirstNativeHeader("shareId");
        if (shareId == null || shareId.isEmpty()) {
            throw new BaseException(ShareLinkErrorCode.SHARE_LINK_NOT_FOUND);
        }
        return shareId;
    }

    private String extractUserId(StompHeaderAccessor accessor) {
        String bearerToken = accessor.getFirstNativeHeader(HttpHeaders.AUTHORIZATION);
        Token token = jwtTokenParser.parseBearerToken(bearerToken);
        jwtValidator.validateToken(token);
        return token.getSubject();
    }
}
