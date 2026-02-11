package com.jackpot.narratix.global.interceptor;

import com.jackpot.narratix.domain.exception.ShareLinkErrorCode;
import com.jackpot.narratix.domain.service.ShareLinkService;
import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.service.JwtTokenParser;
import com.jackpot.narratix.global.auth.jwt.service.JwtValidator;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

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
            String userId = extractUserId(accessor);
            String shareId = Objects.requireNonNull(accessor.getSessionAttributes()).get("shareId").toString();
            if (!shareLinkService.accessShareLink(userId, shareId)) {
                throw new BaseException(ShareLinkErrorCode.SHARE_LINK_ACCESS_LIMIT_EXCEEDED);
            }
            return message;
        }
        return message;
    }

    private String extractUserId(StompHeaderAccessor accessor) {
        String bearerToken = accessor.getFirstNativeHeader(HttpHeaders.AUTHORIZATION);
        Token token = jwtTokenParser.parseBearerToken(bearerToken);
        jwtValidator.validateToken(token);
        return token.getSubject();
    }
}
