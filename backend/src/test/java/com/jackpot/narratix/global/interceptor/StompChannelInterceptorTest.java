package com.jackpot.narratix.global.interceptor;

import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.ShareLinkErrorCode;
import com.jackpot.narratix.domain.service.ShareLinkService;
import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.service.JwtTokenParser;
import com.jackpot.narratix.global.auth.jwt.service.JwtValidator;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.websocket.WebSocketSessionAttributes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StompChannelInterceptorTest {

    @InjectMocks
    private StompChannelInterceptor stompChannelInterceptor;

    @Mock
    private JwtValidator jwtValidator;

    @Mock
    private JwtTokenParser jwtTokenParser;

    @Mock
    private ShareLinkService shareLinkService;

    @Mock
    private MessageChannel messageChannel;

    private StompHeaderAccessor accessor;
    private Map<String, Object> sessionAttributes;

    @BeforeEach
    void setUp() {
        accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        sessionAttributes = new HashMap<>();
        accessor.setSessionAttributes(sessionAttributes);
    }

    @Test
    @DisplayName("CONNECT 명령이 아니면 검증을 수행하지 않고 메시지를 그대로 반환한다")
    void preSend_WhenNotConnectCommand_PassesThrough() {
        // given
        StompHeaderAccessor nonConnectAccessor = StompHeaderAccessor.create(StompCommand.SEND);
        Message<?> message = MessageBuilder.createMessage(new byte[0], nonConnectAccessor.getMessageHeaders());

        // when
        Message<?> result = stompChannelInterceptor.preSend(message, messageChannel);

        // then
        assertThat(result).isEqualTo(message);
        verifyNoInteractions(jwtValidator, jwtTokenParser, shareLinkService);
    }

    @Test
    @DisplayName("shareId 헤더가 없으면 BaseException을 던진다")
    void preSend_WhenShareIdMissing_ThrowsException() {
        // given
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        // when & then
        assertThatThrownBy(() -> stompChannelInterceptor.preSend(message, messageChannel))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ShareLinkErrorCode.SHARE_LINK_NOT_FOUND);
    }

    @Test
    @DisplayName("shareId 헤더가 빈 문자열이면 BaseException을 던진다")
    void preSend_WhenShareIdEmpty_ThrowsException() {
        // given
        accessor.setNativeHeader("shareId", "");
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        // when & then
        assertThatThrownBy(() -> stompChannelInterceptor.preSend(message, messageChannel))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ShareLinkErrorCode.SHARE_LINK_NOT_FOUND);
    }

    @Test
    @DisplayName("정상적인 CONNECT 요청 시 세션 속성에 userId, shareId, role을 저장한다")
    void preSend_ValidConnectRequest_StoresSessionAttributes() {
        // given
        String shareId = "test-share-id-123";
        String userId = "user123";
        String bearerToken = "Bearer test-token";
        ReviewRoleType role = ReviewRoleType.WRITER;

        accessor.setNativeHeader("shareId", shareId);
        accessor.setNativeHeader(HttpHeaders.AUTHORIZATION, bearerToken);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Token mockToken = mock(Token.class);
        given(jwtTokenParser.parseBearerToken(bearerToken)).willReturn(mockToken);
        given(mockToken.getSubject()).willReturn(userId);
        given(shareLinkService.validateShareLinkAndGetRole(userId, shareId)).willReturn(role);
        given(shareLinkService.accessShareLink(userId, role, shareId)).willReturn(true);

        // when
        Message<?> result = stompChannelInterceptor.preSend(message, messageChannel);

        // then
        assertThat(result).isNotNull();
        assertThat(WebSocketSessionAttributes.getUserId(sessionAttributes)).isEqualTo(userId);
        assertThat(WebSocketSessionAttributes.getShareId(sessionAttributes)).isEqualTo(shareId);
        assertThat(WebSocketSessionAttributes.getRole(sessionAttributes)).isEqualTo(role);
    }

    @Test
    @DisplayName("JWT 검증 시 JwtValidator를 호출한다")
    void preSend_ValidatesJwt() {
        // given
        String shareId = "test-share-id-123";
        String userId = "user123";
        String bearerToken = "Bearer test-token";
        ReviewRoleType role = ReviewRoleType.REVIEWER;

        accessor.setNativeHeader("shareId", shareId);
        accessor.setNativeHeader(HttpHeaders.AUTHORIZATION, bearerToken);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Token mockToken = mock(Token.class);
        given(jwtTokenParser.parseBearerToken(bearerToken)).willReturn(mockToken);
        given(mockToken.getSubject()).willReturn(userId);
        given(shareLinkService.validateShareLinkAndGetRole(userId, shareId)).willReturn(role);
        given(shareLinkService.accessShareLink(userId, role, shareId)).willReturn(true);

        // when
        stompChannelInterceptor.preSend(message, messageChannel);

        // then
        verify(jwtValidator).validateToken(mockToken);
    }

    @Test
    @DisplayName("ShareLinkService.validateShareLinkAndGetRole을 호출한다")
    void preSend_CallsValidateShareLinkAndGetRole() {
        // given
        String shareId = "test-share-id-123";
        String userId = "user123";
        String bearerToken = "Bearer test-token";
        ReviewRoleType role = ReviewRoleType.WRITER;

        accessor.setNativeHeader("shareId", shareId);
        accessor.setNativeHeader(HttpHeaders.AUTHORIZATION, bearerToken);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Token mockToken = mock(Token.class);
        given(jwtTokenParser.parseBearerToken(bearerToken)).willReturn(mockToken);
        given(mockToken.getSubject()).willReturn(userId);
        given(shareLinkService.validateShareLinkAndGetRole(userId, shareId)).willReturn(role);
        given(shareLinkService.accessShareLink(userId, role, shareId)).willReturn(true);

        // when
        stompChannelInterceptor.preSend(message, messageChannel);

        // then
        verify(shareLinkService).validateShareLinkAndGetRole(userId, shareId);
    }

    @Test
    @DisplayName("접근 제한을 초과하면 BaseException을 던진다")
    void preSend_WhenAccessLimitExceeded_ThrowsException() {
        // given
        String shareId = "test-share-id-123";
        String userId = "user123";
        String bearerToken = "Bearer test-token";
        ReviewRoleType role = ReviewRoleType.REVIEWER;

        accessor.setNativeHeader("shareId", shareId);
        accessor.setNativeHeader(HttpHeaders.AUTHORIZATION, bearerToken);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Token mockToken = mock(Token.class);
        given(jwtTokenParser.parseBearerToken(bearerToken)).willReturn(mockToken);
        given(mockToken.getSubject()).willReturn(userId);
        given(shareLinkService.validateShareLinkAndGetRole(userId, shareId)).willReturn(role);
        given(shareLinkService.accessShareLink(userId, role, shareId)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> stompChannelInterceptor.preSend(message, messageChannel))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ShareLinkErrorCode.SHARE_LINK_ACCESS_LIMIT_EXCEEDED);
    }

    @Test
    @DisplayName("ShareLinkService.accessShareLink를 userId, role, shareId와 함께 호출한다")
    void preSend_CallsAccessShareLinkWithCorrectParameters() {
        // given
        String shareId = "test-share-id-123";
        String userId = "user123";
        String bearerToken = "Bearer test-token";
        ReviewRoleType role = ReviewRoleType.WRITER;

        accessor.setNativeHeader("shareId", shareId);
        accessor.setNativeHeader(HttpHeaders.AUTHORIZATION, bearerToken);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Token mockToken = mock(Token.class);
        given(jwtTokenParser.parseBearerToken(bearerToken)).willReturn(mockToken);
        given(mockToken.getSubject()).willReturn(userId);
        given(shareLinkService.validateShareLinkAndGetRole(userId, shareId)).willReturn(role);
        given(shareLinkService.accessShareLink(userId, role, shareId)).willReturn(true);

        // when
        stompChannelInterceptor.preSend(message, messageChannel);

        // then
        verify(shareLinkService).accessShareLink(userId, role, shareId);
    }
}