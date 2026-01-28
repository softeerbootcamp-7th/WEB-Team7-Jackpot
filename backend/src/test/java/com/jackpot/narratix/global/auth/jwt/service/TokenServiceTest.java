package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @Mock
    private JwtGenerator jwtGenerator;

    @Mock
    private JwtValidator jwtValidator;

    @Mock
    private JwtTokenParser jwtTokenParser;

    @InjectMocks
    private TokenService tokenService;

    private static final String BEARER_REFRESH_TOKEN = "Bearer refresh.token.here";
    private static final String TEST_USER_ID = "testUser123";

    @Test
    void 토큰_발급_성공() {
        // given
        Date now = new Date();
        Date accessExpiration = new Date(now.getTime() + 3600000);
        Date refreshExpiration = new Date(now.getTime() + 604800000);

        AccessToken accessToken = AccessToken.of("access.token", TEST_USER_ID, now, accessExpiration);
        RefreshToken refreshToken = RefreshToken.of("refresh.token", TEST_USER_ID, now, refreshExpiration);

        given(jwtGenerator.generateAccessToken(TEST_USER_ID)).willReturn(accessToken);
        given(jwtGenerator.generateRefreshToken(TEST_USER_ID)).willReturn(refreshToken);

        // when
        TokenResponse result = tokenService.issueToken(TEST_USER_ID);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getAccessToken()).isEqualTo("access.token");
        assertThat(result.getRefreshToken()).isEqualTo("refresh.token");

        then(jwtGenerator).should(times(1)).generateAccessToken(TEST_USER_ID);
        then(jwtGenerator).should(times(1)).generateRefreshToken(TEST_USER_ID);
    }

    @Test
    void RefreshToken으로_재발급_성공() {
        // given
        Date now = new Date();
        Date refreshExpiration = new Date(now.getTime() + 604800000);
        Date accessExpiration = new Date(now.getTime() + 3600000);

        Token parsedToken = Token.of(BEARER_REFRESH_TOKEN, TEST_USER_ID, now, refreshExpiration);
        AccessToken newAccessToken = AccessToken.of("new.access.token", TEST_USER_ID, now, accessExpiration);

        given(jwtTokenParser.parseToken(BEARER_REFRESH_TOKEN)).willReturn(parsedToken);
        willDoNothing().given(jwtValidator).validateToken(parsedToken);
        given(jwtGenerator.generateAccessToken(TEST_USER_ID)).willReturn(newAccessToken);

        // when
        AccessToken result = tokenService.reissueToken(BEARER_REFRESH_TOKEN);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo("new.access.token");
        assertThat(result.getSubject()).isEqualTo(TEST_USER_ID);

        then(jwtTokenParser).should(times(1)).parseToken(BEARER_REFRESH_TOKEN);
        then(jwtValidator).should(times(1)).validateToken(parsedToken);
        then(jwtGenerator).should(times(1)).generateAccessToken(TEST_USER_ID);
    }

    @Test
    void 유효하지_않은_Token으로_재발급_실패() {
        // given
        Date now = new Date();
        Date refreshExpiration = new Date(now.getTime() + 604800000);
        Token parsedToken = Token.of(BEARER_REFRESH_TOKEN, TEST_USER_ID, now, refreshExpiration);

        given(jwtTokenParser.parseToken(BEARER_REFRESH_TOKEN)).willReturn(parsedToken);
        willThrow(new JwtException("Invalid token"))
                .given(jwtValidator).validateToken(parsedToken);

        // when & then
        assertThatThrownBy(() -> tokenService.reissueToken(BEARER_REFRESH_TOKEN))
                .isInstanceOf(JwtException.class)
                .hasMessageContaining("Invalid token");

        then(jwtTokenParser).should(times(1)).parseToken(BEARER_REFRESH_TOKEN);
        then(jwtValidator).should(times(1)).validateToken(parsedToken);
        then(jwtGenerator).should(never()).generateAccessToken(anyString());
    }

    @Test
    void 만료된_Token으로_재발급_실패() {
        // given
        Date now = new Date();
        Date refreshExpiration = new Date(now.getTime() + 604800000);
        Token parsedToken = Token.of(BEARER_REFRESH_TOKEN, TEST_USER_ID, now, refreshExpiration);

        given(jwtTokenParser.parseToken(BEARER_REFRESH_TOKEN)).willReturn(parsedToken);
        willThrow(new JwtException("Expired token"))
                .given(jwtValidator).validateToken(parsedToken);

        // when & then
        assertThatThrownBy(() -> tokenService.reissueToken(BEARER_REFRESH_TOKEN))
                .isInstanceOf(JwtException.class)
                .hasMessageContaining("Expired token");

        then(jwtTokenParser).should(times(1)).parseToken(BEARER_REFRESH_TOKEN);
        then(jwtValidator).should(times(1)).validateToken(parsedToken);
        then(jwtGenerator).should(never()).generateAccessToken(anyString());
    }

    @Test
    void 토큰_재발급_시_올바른_순서로_메서드_호출() {
        // given
        Date now = new Date();
        Date refreshExpiration = new Date(now.getTime() + 604800000);
        Date accessExpiration = new Date(now.getTime() + 3600000);

        Token parsedToken = Token.of(BEARER_REFRESH_TOKEN, TEST_USER_ID, now, refreshExpiration);
        AccessToken newAccessToken = AccessToken.of("new.access.token", TEST_USER_ID, now, accessExpiration);

        given(jwtTokenParser.parseToken(BEARER_REFRESH_TOKEN)).willReturn(parsedToken);
        willDoNothing().given(jwtValidator).validateToken(parsedToken);
        given(jwtGenerator.generateAccessToken(TEST_USER_ID)).willReturn(newAccessToken);

        // when
        tokenService.reissueToken(BEARER_REFRESH_TOKEN);

        // then
        var inOrder = inOrder(jwtTokenParser, jwtValidator, jwtGenerator);
        then(jwtTokenParser).should(inOrder).parseToken(BEARER_REFRESH_TOKEN);
        then(jwtValidator).should(inOrder).validateToken(parsedToken);
        then(jwtGenerator).should(inOrder).generateAccessToken(TEST_USER_ID);
    }

    @Test
    void 파싱된_Token에서_올바른_subject_추출() {
        // given
        String expectedUserId = "user@example.com";
        Date now = new Date();
        Date refreshExpiration = new Date(now.getTime() + 604800000);
        Date accessExpiration = new Date(now.getTime() + 3600000);

        Token parsedToken = Token.of(BEARER_REFRESH_TOKEN, expectedUserId, now, refreshExpiration);
        AccessToken newAccessToken = AccessToken.of("new.access.token", expectedUserId, now, accessExpiration);

        given(jwtTokenParser.parseToken(BEARER_REFRESH_TOKEN)).willReturn(parsedToken);
        willDoNothing().given(jwtValidator).validateToken(parsedToken);
        given(jwtGenerator.generateAccessToken(expectedUserId)).willReturn(newAccessToken);

        // when
        AccessToken result = tokenService.reissueToken(BEARER_REFRESH_TOKEN);

        // then
        assertThat(result.getSubject()).isEqualTo(expectedUserId);
        then(jwtGenerator).should(times(1)).generateAccessToken(expectedUserId);
    }

    @Test
    void 여러_사용자에_대한_토큰_발급() {
        // given
        String user1 = "user1";
        String user2 = "user2";

        Date now = new Date();
        Date accessExpiration = new Date(now.getTime() + 3600000);
        Date refreshExpiration = new Date(now.getTime() + 604800000);

        AccessToken accessToken1 = AccessToken.of("access1", user1, now, accessExpiration);
        RefreshToken refreshToken1 = RefreshToken.of("refresh1", user1, now, refreshExpiration);

        AccessToken accessToken2 = AccessToken.of("access2", user2, now, accessExpiration);
        RefreshToken refreshToken2 = RefreshToken.of("refresh2", user2, now, refreshExpiration);

        given(jwtGenerator.generateAccessToken(user1)).willReturn(accessToken1);
        given(jwtGenerator.generateRefreshToken(user1)).willReturn(refreshToken1);
        given(jwtGenerator.generateAccessToken(user2)).willReturn(accessToken2);
        given(jwtGenerator.generateRefreshToken(user2)).willReturn(refreshToken2);

        // when
        TokenResponse result1 = tokenService.issueToken(user1);
        TokenResponse result2 = tokenService.issueToken(user2);

        // then
        assertThat(result1.getAccessToken()).isEqualTo("access1");
        assertThat(result1.getRefreshToken()).isEqualTo("refresh1");
        assertThat(result2.getAccessToken()).isEqualTo("access2");
        assertThat(result2.getRefreshToken()).isEqualTo("refresh2");

        then(jwtGenerator).should(times(1)).generateAccessToken(user1);
        then(jwtGenerator).should(times(1)).generateRefreshToken(user1);
        then(jwtGenerator).should(times(1)).generateAccessToken(user2);
        then(jwtGenerator).should(times(1)).generateRefreshToken(user2);
    }
}