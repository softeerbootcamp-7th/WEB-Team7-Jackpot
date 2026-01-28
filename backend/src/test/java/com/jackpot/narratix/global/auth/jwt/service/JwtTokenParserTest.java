package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.Token;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class JwtTokenParserTest {

    @Mock
    private JwtKeyProvider jwtKeyProvider;

    @InjectMocks
    private JwtTokenParser jwtTokenParser;

    private static final String TEST_SECRET = "test-secret-key-for-jwt-token-generation-and-parsing";
    private static final String TEST_SUBJECT = "testUser123";
    private static final String BEARER_PREFIX = "Bearer ";

    private SecretKey createSecretKey() {
        String encodedSecret = Base64.getEncoder().encodeToString(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
        byte[] keyBytes = Base64.getDecoder().decode(encodedSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Date createDateWithoutMillis(long timeMillis) {
        return new Date((timeMillis / 1000) * 1000);
    }

    @Test
    void Token_파싱_성공() {
        // given
        SecretKey secretKey = createSecretKey();
        given(jwtKeyProvider.getKey()).willReturn(secretKey);

        Date now = createDateWithoutMillis(System.currentTimeMillis());
        Date expiration = createDateWithoutMillis(now.getTime() + 3600000);

        String token = Jwts.builder()
                .subject(TEST_SUBJECT)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();

        String bearerToken = BEARER_PREFIX + token;

        // when
        Token result = jwtTokenParser.parseToken(bearerToken);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo(bearerToken);
        assertThat(result.getSubject()).isEqualTo(TEST_SUBJECT);
        assertThat(result.getIssuedAt()).isEqualTo(now);
        assertThat(result.getExpiration()).isEqualTo(expiration);
    }

    @Test
    void Bearer_prefix_없는_토큰_파싱_실패() {
        // given
        String tokenWithoutBearer = "invalid.token.here";

        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseToken(tokenWithoutBearer))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void 잘못된_형식의_토큰_파싱_실패() {
        // given
        SecretKey secretKey = createSecretKey();
        given(jwtKeyProvider.getKey()).willReturn(secretKey);

        String invalidToken = BEARER_PREFIX + "invalid.jwt.token";

        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseToken(invalidToken))
                .isInstanceOf(Exception.class);
    }

    @Test
    void 만료된_토큰도_파싱은_성공() {
        // given
        SecretKey secretKey = createSecretKey();
        given(jwtKeyProvider.getKey()).willReturn(secretKey);

        long currentTime = System.currentTimeMillis();
        Date issuedAt = createDateWithoutMillis(currentTime - 7200000); // 2시간 전 발급
        Date pastExpiration = createDateWithoutMillis(currentTime - 3600000); // 1시간 전 만료

        String token = Jwts.builder()
                .subject(TEST_SUBJECT)
                .issuedAt(issuedAt)
                .expiration(pastExpiration)
                .signWith(secretKey)
                .compact();

        String bearerToken = BEARER_PREFIX + token;

        // when
        Token result = jwtTokenParser.parseToken(bearerToken);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getSubject()).isEqualTo(TEST_SUBJECT);
        assertThat(result.isExpired()).isTrue();
    }

    @Test
    void 다양한_subject로_토큰_파싱() {
        // given
        SecretKey secretKey = createSecretKey();
        given(jwtKeyProvider.getKey()).willReturn(secretKey);

        String emailSubject = "user@example.com";
        Date now = createDateWithoutMillis(System.currentTimeMillis());
        Date expiration = createDateWithoutMillis(now.getTime() + 3600000);

        String token = Jwts.builder()
                .subject(emailSubject)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();

        String bearerToken = BEARER_PREFIX + token;

        // when
        Token result = jwtTokenParser.parseToken(bearerToken);

        // then
        assertThat(result.getSubject()).isEqualTo(emailSubject);
    }

    @Test
    void 공백_토큰_파싱_실패() {
        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseToken(""))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void null_토큰_파싱_실패() {
        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseToken(null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void Bearer만_있는_토큰_파싱_실패() {
        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseToken(BEARER_PREFIX))
                .isInstanceOf(Exception.class);
    }

    @Test
    void 장기간_유효한_토큰_파싱_성공() {
        // given
        SecretKey secretKey = createSecretKey();
        given(jwtKeyProvider.getKey()).willReturn(secretKey);

        Date now = createDateWithoutMillis(System.currentTimeMillis());
        Date longExpiration = createDateWithoutMillis(now.getTime() + 604800000); // 7일 후

        String token = Jwts.builder()
                .subject(TEST_SUBJECT)
                .issuedAt(now)
                .expiration(longExpiration)
                .signWith(secretKey)
                .compact();

        String bearerToken = BEARER_PREFIX + token;

        // when
        Token result = jwtTokenParser.parseToken(bearerToken);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getSubject()).isEqualTo(TEST_SUBJECT);
        assertThat(result.getExpiration()).isEqualTo(longExpiration);
        assertThat(result.isExpired()).isFalse();
    }

    @Test
    void 파싱된_토큰의_모든_필드가_올바르게_매핑됨() {
        // given
        SecretKey secretKey = createSecretKey();
        given(jwtKeyProvider.getKey()).willReturn(secretKey);

        Date issuedAt = createDateWithoutMillis(System.currentTimeMillis() - 1000);
        Date expiration = createDateWithoutMillis(System.currentTimeMillis() + 3600000);
        String subject = "user@example.com";

        String token = Jwts.builder()
                .subject(subject)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();

        String bearerToken = BEARER_PREFIX + token;

        // when
        Token result = jwtTokenParser.parseToken(bearerToken);

        // then
        assertThat(result.getToken()).isEqualTo(bearerToken);
        assertThat(result.getSubject()).isEqualTo(subject);
        assertThat(result.getIssuedAt()).isEqualTo(issuedAt);
        assertThat(result.getExpiration()).isEqualTo(expiration);
    }
}