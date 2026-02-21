package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.exception.JwtException;
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
    void AccessToken_파싱_성공() {
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
        Token result = jwtTokenParser.parseBearerToken(bearerToken);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo(bearerToken);
        assertThat(result.getSubject()).isEqualTo(TEST_SUBJECT);
        assertThat(result.getIssuedAt()).isEqualTo(now);
        assertThat(result.getExpiration()).isEqualTo(expiration);
    }

    @Test
    void Bearer_prefix_없는_AccessToken_파싱_실패() {
        // given
        String tokenWithoutBearer = "invalid.token.here";

        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseBearerToken(tokenWithoutBearer))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void 잘못된_형식의_토큰_파싱_실패() {
        // given
        SecretKey secretKey = createSecretKey();
        given(jwtKeyProvider.getKey()).willReturn(secretKey);

        String invalidToken = BEARER_PREFIX + "invalid.jwt.token";

        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseBearerToken(invalidToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void 만료된_토큰은_오류_발생() {
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

        String invalidToken = BEARER_PREFIX + token;

        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseBearerToken(invalidToken))
                .isInstanceOf(JwtException.class);
    }


    @Test
    void 공백_토큰_파싱_실패() {
        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseBearerToken(""))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void null_토큰_파싱_실패() {
        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseBearerToken(null))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void Bearer만_있는_토큰_파싱_실패() {
        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseBearerToken(BEARER_PREFIX))
                .isInstanceOf(JwtException.class);
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
        Token result = jwtTokenParser.parseBearerToken(bearerToken);

        // then
        assertThat(result.getToken()).isEqualTo(bearerToken);
        assertThat(result.getSubject()).isEqualTo(subject);
        assertThat(result.getIssuedAt()).isEqualTo(issuedAt);
        assertThat(result.getExpiration()).isEqualTo(expiration);
    }

    @Test
    void JWT_토큰_파싱_성공() {
        // given
        SecretKey secretKey = createSecretKey();
        given(jwtKeyProvider.getKey()).willReturn(secretKey);

        Date now = createDateWithoutMillis(System.currentTimeMillis());
        Date expiration = createDateWithoutMillis(now.getTime() + 3600000);

        String jwtToken = Jwts.builder()
                .subject(TEST_SUBJECT)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();

        // when
        Token result = jwtTokenParser.parseJwtToken(jwtToken);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo(jwtToken);
        assertThat(result.getSubject()).isEqualTo(TEST_SUBJECT);
        assertThat(result.getIssuedAt()).isEqualTo(now);
        assertThat(result.getExpiration()).isEqualTo(expiration);
    }

    @Test
    void Bearer_prefix가_포함된_JWT_토큰_파싱_실패() {
        // given
        SecretKey secretKey = createSecretKey();
        given(jwtKeyProvider.getKey()).willReturn(secretKey);

        Date now = createDateWithoutMillis(System.currentTimeMillis());
        Date expiration = createDateWithoutMillis(now.getTime() + 3600000);

        String jwtToken = Jwts.builder()
                .subject(TEST_SUBJECT)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();

        String bearerToken = BEARER_PREFIX + jwtToken;

        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseJwtToken(bearerToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void 잘못된_형식의_JWT_토큰_파싱_실패() {
        // given
        SecretKey secretKey = createSecretKey();
        given(jwtKeyProvider.getKey()).willReturn(secretKey);

        String invalidJwtToken = "invalid.jwt.token";

        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseJwtToken(invalidJwtToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void 만료된_JWT_토큰은_오류_발생() {
        // given
        SecretKey secretKey = createSecretKey();
        given(jwtKeyProvider.getKey()).willReturn(secretKey);

        long currentTime = System.currentTimeMillis();
        Date issuedAt = createDateWithoutMillis(currentTime - 7200000); // 2시간 전 발급
        Date pastExpiration = createDateWithoutMillis(currentTime - 3600000); // 1시간 전 만료

        String jwtToken = Jwts.builder()
                .subject(TEST_SUBJECT)
                .issuedAt(issuedAt)
                .expiration(pastExpiration)
                .signWith(secretKey)
                .compact();

        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseJwtToken(jwtToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void null_JWT_토큰_파싱_실패() {
        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseJwtToken(null))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void 파싱된_JWT_토큰의_모든_필드가_올바르게_매핑됨() {
        // given
        SecretKey secretKey = createSecretKey();
        given(jwtKeyProvider.getKey()).willReturn(secretKey);

        Date issuedAt = createDateWithoutMillis(System.currentTimeMillis() - 1000);
        Date expiration = createDateWithoutMillis(System.currentTimeMillis() + 3600000);
        String subject = "refresh_user@example.com";

        String jwtToken = Jwts.builder()
                .subject(subject)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();

        // when
        Token result = jwtTokenParser.parseJwtToken(jwtToken);

        // then
        assertThat(result.getToken()).isEqualTo(jwtToken);
        assertThat(result.getSubject()).isEqualTo(subject);
        assertThat(result.getIssuedAt()).isEqualTo(issuedAt);
        assertThat(result.getExpiration()).isEqualTo(expiration);
    }
}