package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.Token;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class JwtValidatorTest {

    @InjectMocks
    private JwtValidator jwtValidator;

    private static final String TEST_TOKEN = "test.jwt.token";
    private static final String TEST_USER_ID = "testUser";

    @Test
    void 유효한_Token_검증_성공() {
        // given
        Date now = new Date();
        Date futureExpiration = new Date(now.getTime() + 3600000);
        Token validToken = Token.of(TEST_TOKEN, TEST_USER_ID, now, futureExpiration);

        // when & then
        assertThatCode(() -> jwtValidator.validateToken(validToken))
                .doesNotThrowAnyException();
    }

    @Test
    void 만료된_Token_검증_실패() {
        // given
        long currentTime = System.currentTimeMillis();
        Date issuedAt = new Date(currentTime - 5000);
        Date pastExpiration = new Date(currentTime - 1000);
        Token expiredToken = Token.of(TEST_TOKEN, TEST_USER_ID, issuedAt, pastExpiration);

        // when & then
        assertThatThrownBy(() -> jwtValidator.validateToken(expiredToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void 방금_만료된_Token_검증_실패() {
        // given
        long currentTime = System.currentTimeMillis();
        Date issuedAt = new Date(currentTime - 1000);
        Date justExpired = new Date(currentTime - 1);
        Token expiredToken = Token.of(TEST_TOKEN, TEST_USER_ID, issuedAt, justExpired);

        // when & then
        assertThatThrownBy(() -> jwtValidator.validateToken(expiredToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void 만료_시간이_현재보다_많이_지난_Token_검증_실패() {
        // given
        long currentTime = System.currentTimeMillis();
        Date issuedAt = new Date(currentTime - 86400000 - 1000);
        Date longPastExpiration = new Date(currentTime - 86400000); // 24시간 전
        Token expiredToken = Token.of(TEST_TOKEN, TEST_USER_ID, issuedAt, longPastExpiration);

        // when & then
        assertThatThrownBy(() -> jwtValidator.validateToken(expiredToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void 장시간_유효한_Token_검증_성공() {
        // given
        Date now = new Date();
        Date farFutureExpiration = new Date(now.getTime() + 604800000); // 7일 후
        Token validToken = Token.of(TEST_TOKEN, TEST_USER_ID, now, farFutureExpiration);

        // when & then
        assertThatCode(() -> jwtValidator.validateToken(validToken))
                .doesNotThrowAnyException();
    }

    @Test
    void 만료_직전_Token_검증_성공() {
        // given
        Date now = new Date();
        Date almostExpired = new Date(now.getTime() + 1000); // 1초 후 만료
        Token validToken = Token.of(TEST_TOKEN, TEST_USER_ID, now, almostExpired);

        // when & then
        assertThatCode(() -> jwtValidator.validateToken(validToken))
                .doesNotThrowAnyException();
    }

    @Test
    void 다른_사용자의_Token_검증_성공() {
        // given
        String differentUserId = "anotherUser@example.com";
        Date now = new Date();
        Date futureExpiration = new Date(now.getTime() + 3600000);
        Token validToken = Token.of(TEST_TOKEN, differentUserId, now, futureExpiration);

        // when & then
        assertThatCode(() -> jwtValidator.validateToken(validToken))
                .doesNotThrowAnyException();
    }

    @Test
    void 여러_Token을_순차적으로_검증() {
        // given
        long currentTime = System.currentTimeMillis();
        Date futureExpiration = new Date(currentTime + 3600000);
        Date pastExpiration = new Date(currentTime - 1000);
        Date issuedAt = new Date(currentTime - 5000);

        Token validToken1 = Token.of("token1", "user1", issuedAt, futureExpiration);
        Token validToken2 = Token.of("token2", "user2", issuedAt, futureExpiration);
        Token expiredToken = Token.of("token3", "user3", issuedAt, pastExpiration);

        // when & then
        assertThatCode(() -> jwtValidator.validateToken(validToken1))
                .doesNotThrowAnyException();
        assertThatCode(() -> jwtValidator.validateToken(validToken2))
                .doesNotThrowAnyException();
        assertThatThrownBy(() -> jwtValidator.validateToken(expiredToken))
                .isInstanceOf(JwtException.class);
    }
}