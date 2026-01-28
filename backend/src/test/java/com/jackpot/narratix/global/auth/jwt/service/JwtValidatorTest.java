package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class JwtValidatorTest {

    @Mock
    private JwtTokenParser jwtTokenParser;

    @InjectMocks
    private JwtValidator jwtValidator;

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String TEST_TOKEN = "test.jwt.token";
    private static final String BEARER_TOKEN = BEARER_PREFIX + TEST_TOKEN;

    @Test
    void 유효한_AccessToken_검증_성공() {
        // given
        Date now = new Date();
        Date futureExpiration = new Date(now.getTime() + 3600000);
        AccessToken validToken = AccessToken.of(TEST_TOKEN, "testUser", now, futureExpiration);

        given(jwtTokenParser.parseAccessToken(TEST_TOKEN)).willReturn(validToken);

        // when & then
        assertThatCode(() -> jwtValidator.validateAccessToken(BEARER_TOKEN))
                .doesNotThrowAnyException();

        then(jwtTokenParser).should(times(1)).parseAccessToken(TEST_TOKEN);
    }

    @Test
    void 유효한_RefreshToken_검증_성공() {
        // given
        Date now = new Date();
        Date futureExpiration = new Date(now.getTime() + 604800000);
        RefreshToken validToken = RefreshToken.of(TEST_TOKEN, "testUser", now, futureExpiration);

        given(jwtTokenParser.parseRefreshToken(TEST_TOKEN)).willReturn(validToken);

        // when & then
        assertThatCode(() -> jwtValidator.validateRefreshToken(BEARER_TOKEN))
                .doesNotThrowAnyException();

        then(jwtTokenParser).should(times(1)).parseRefreshToken(TEST_TOKEN);
    }

    @Test
    void AccessToken_검증_실패시_오류를_던진다() {
        // given
        Date now = new Date();
        Date pastExpiration = new Date(now.getTime() - 1000);
        AccessToken expiredToken = AccessToken.of(TEST_TOKEN, "testUser", now, pastExpiration);

        given(jwtTokenParser.parseAccessToken(TEST_TOKEN)).willReturn(expiredToken);

        // when & then
        assertThatThrownBy(() -> jwtValidator.validateAccessToken(BEARER_TOKEN))
                .isInstanceOf(JwtException.class);

        then(jwtTokenParser).should(times(1)).parseAccessToken(TEST_TOKEN);
    }

    @Test
    void 잘못된_형식의_AccessToken_검증_실패() {
        // given
        given(jwtTokenParser.parseAccessToken(TEST_TOKEN))
                .willThrow(new JwtException("Invalid token format"));

        // when & then
        assertThatThrownBy(() -> jwtValidator.validateAccessToken(BEARER_TOKEN))
                .isInstanceOf(JwtException.class);

        then(jwtTokenParser).should(times(1)).parseAccessToken(TEST_TOKEN);
    }

    @Test
    void Bearer_prefix_없는_토큰_검증_실패() {
        // when & then
        assertThatThrownBy(() -> jwtValidator.validateAccessToken(TEST_TOKEN))
                .isInstanceOf(Exception.class);

        then(jwtTokenParser).should(never()).parseAccessToken(anyString());
    }

    @Test
    void 만료된_RefreshToken_검증_실패() {
        // given
        Date now = new Date();
        Date pastExpiration = new Date(now.getTime() - 1000);
        RefreshToken expiredToken = RefreshToken.of(TEST_TOKEN, "testUser", now, pastExpiration);

        given(jwtTokenParser.parseRefreshToken(TEST_TOKEN)).willReturn(expiredToken);

        // when & then
        assertThatThrownBy(() -> jwtValidator.validateRefreshToken(BEARER_TOKEN))
                .isInstanceOf(JwtException.class);

        then(jwtTokenParser).should(times(1)).parseRefreshToken(TEST_TOKEN);
    }

    @Test
    void 파싱_실패_시_적절한_예외_전파() {
        // given
        given(jwtTokenParser.parseAccessToken(TEST_TOKEN))
                .willThrow(new RuntimeException("Parsing error"));

        // when & then
        assertThatThrownBy(() -> jwtValidator.validateAccessToken(BEARER_TOKEN))
                .isInstanceOf(JwtException.class);

        then(jwtTokenParser).should(times(1)).parseAccessToken(TEST_TOKEN);
    }
}