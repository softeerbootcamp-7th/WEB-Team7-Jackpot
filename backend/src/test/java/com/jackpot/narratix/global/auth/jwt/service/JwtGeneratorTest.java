package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

@ExtendWith(MockitoExtension.class)
class JwtGeneratorTest {

    private JwtGenerator jwtGenerator;

    private static final String TEST_SECRET = Jwts.SIG.HS256.key().build().toString();
    private static final Long ACCESS_TOKEN_EXPIRATION = 3600000L; // 1 hour
    private static final Long REFRESH_TOKEN_EXPIRATION = 604800000L; // 7 days

    @BeforeEach
    void setUp() {
        jwtGenerator = new JwtGenerator();
        ReflectionTestUtils.setField(jwtGenerator, "JWT_SECRET", TEST_SECRET);
        ReflectionTestUtils.setField(jwtGenerator, "ACCESS_TOKEN_EXPIRATION_TIME", ACCESS_TOKEN_EXPIRATION);
        ReflectionTestUtils.setField(jwtGenerator, "REFRESH_TOKEN_EXPIRATION_TIME", REFRESH_TOKEN_EXPIRATION);
    }

    @Test
    void AccessToken_생성_성공() {
        // given
        String subjectId = "testUser123";

        // when
        AccessToken accessToken = jwtGenerator.generateAccessToken(subjectId);

        // then
        assertThat(accessToken).isNotNull();
        assertThat(accessToken.getToken()).isNotEmpty();
        assertThat(accessToken.getSubject()).isEqualTo(subjectId);
        assertThat(accessToken.getIssuedAt()).isNotNull();
        assertThat(accessToken.getExpiration()).isNotNull();
        assertThat(accessToken.getExpiration()).isAfter(accessToken.getIssuedAt());
    }

    @Test
    void RefreshToken_생성_성공() {
        // given
        String subjectId = "testUser456";

        // when
        RefreshToken refreshToken = jwtGenerator.generateRefreshToken(subjectId);

        // then
        assertThat(refreshToken).isNotNull();
        assertThat(refreshToken.getToken()).isNotEmpty();
        assertThat(refreshToken.getSubject()).isEqualTo(subjectId);
        assertThat(refreshToken.getIssuedAt()).isNotNull();
        assertThat(refreshToken.getExpiration()).isNotNull();
        assertThat(refreshToken.getExpiration()).isAfter(refreshToken.getIssuedAt());
    }

    @Test
    void AccessToken과_RefreshToken의_만료_시간이_다름() {
        // given
        String subjectId = "testUser789";

        // when
        AccessToken accessToken = jwtGenerator.generateAccessToken(subjectId);
        RefreshToken refreshToken = jwtGenerator.generateRefreshToken(subjectId);

        long accessTokenDuration = accessToken.getExpiration().getTime() - accessToken.getIssuedAt().getTime();
        long refreshTokenDuration = refreshToken.getExpiration().getTime() - refreshToken.getIssuedAt().getTime();

        // then
        assertThat(refreshTokenDuration).isGreaterThan(accessTokenDuration);
        assertThat(accessTokenDuration).isCloseTo(ACCESS_TOKEN_EXPIRATION, within(1000L));
        assertThat(refreshTokenDuration).isCloseTo(REFRESH_TOKEN_EXPIRATION, within(1000L));
    }

    @Test
    void 생성된_토큰에_올바른_subject_포함() {
        // given
        String expectedSubject = "user@example.com";

        // when
        AccessToken accessToken = jwtGenerator.generateAccessToken(expectedSubject);

        // then
        assertThat(accessToken.getSubject()).isEqualTo(expectedSubject);
    }
}