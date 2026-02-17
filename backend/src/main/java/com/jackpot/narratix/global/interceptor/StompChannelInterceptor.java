package com.jackpot.narratix.global.interceptor;

import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.ShareLinkErrorCode;
import com.jackpot.narratix.domain.exception.WebSocketErrorCode;
import com.jackpot.narratix.domain.service.ShareLinkService;
import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.service.JwtTokenParser;
import com.jackpot.narratix.global.auth.jwt.service.JwtValidator;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.websocket.WebSocketSessionAttributes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompChannelInterceptor implements ChannelInterceptor {

    private final JwtValidator jwtValidator;
    private final JwtTokenParser jwtTokenParser;
    private final ShareLinkService shareLinkService;

    private static final String WRITER_SUBSCRIBE_ENDPOINT = "/writer";
    private static final String REVIEWER_SUBSCRIBE_ENDPOINT = "/reviewer";


    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        final StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.info("WebSocket CONNECTING...");
            setSessionAttributes(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            log.info("WebSocket SUBSCRIBING...");
            convertSubscribeEndPoint(accessor);
            return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
        }

        return message;
    }

    private void convertSubscribeEndPoint(StompHeaderAccessor accessor) {
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes == null) {
            throw new IllegalStateException("Session attributes cannot be null during Subscribe");
        }

        ReviewRoleType role = WebSocketSessionAttributes.getRole(sessionAttributes);

        String suffixEndPoint = "";
        if (role == ReviewRoleType.WRITER) {
            suffixEndPoint = WRITER_SUBSCRIBE_ENDPOINT;
        } else if (role == ReviewRoleType.REVIEWER) {
            suffixEndPoint = REVIEWER_SUBSCRIBE_ENDPOINT;
        } else{
            throw new BaseException(WebSocketErrorCode.ROLE_NOT_FOUND);
        }

        String convertedDestination = accessor.getDestination() + suffixEndPoint;
        accessor.setDestination(convertedDestination);

        String userId = WebSocketSessionAttributes.getUserId(sessionAttributes);
        String shareId = WebSocketSessionAttributes.getShareId(sessionAttributes);
        log.info("WebSocket SUBSCRIBED at {}: userId={}, shareId={}, role={}", convertedDestination, userId, shareId, role);
    }

    private void setSessionAttributes(StompHeaderAccessor accessor) {
        String userId = extractUserId(accessor);
        String shareId = getShareId(accessor);
        ReviewRoleType role = shareLinkService.validateShareLinkAndGetRole(userId, shareId);

        String sessionId = accessor.getSessionId();
        if (!shareLinkService.accessShareLink(sessionId, userId, role, shareId)) {
            log.warn("Share link access denied: userId={}, shareId={}, role={}", userId, shareId, role);
            throw new BaseException(ShareLinkErrorCode.SHARE_LINK_ACCESS_LIMIT_EXCEEDED);
        }

        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes == null) {
            throw new IllegalStateException("Session attributes cannot be null during CONNECT");
        }

        WebSocketSessionAttributes.setUserId(sessionAttributes, userId);
        WebSocketSessionAttributes.setShareId(sessionAttributes, shareId);
        WebSocketSessionAttributes.setRole(sessionAttributes, role);

        log.info("WebSocket CONNECT: userId={}, shareId={}, role={}", userId, shareId, role);
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
