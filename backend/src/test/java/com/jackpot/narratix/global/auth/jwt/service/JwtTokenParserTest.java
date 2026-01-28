package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
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
class JwtTokenParserTest {

    @Mock
    private JwtGenerator jwtGenerator;

    @InjectMocks
    private JwtTokenParser jwtTokenParser;

    private static final String TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature";
    private static final String TEST_SUBJECT = "testUser123";

    @Test
    void AccessToken_파싱_성공() {
        // given
        Date now = new Date();
        Date expiration = new Date(now.getTime() + 3600000);

        Claims mockClaims = mock(Claims.class);
        given(mockClaims.getSubject()).willReturn(TEST_SUBJECT);
        given(mockClaims.getIssuedAt()).willReturn(now);
        given(mockClaims.getExpiration()).willReturn(expiration);

        @SuppressWarnings("unchecked")
        Jws<Claims> mockJws = mock(Jws.class);
        given(mockJws.getPayload()).willReturn(mockClaims);

        JwtParser mockParser = mock(JwtParser.class);
        given(jwtGenerator.getJwtParser()).willReturn(mockParser);
        given(mockParser.parseSignedClaims(anyString())).willReturn(mockJws);

        // when
        AccessToken result = jwtTokenParser.parseAccessToken(TEST_TOKEN);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo(TEST_TOKEN);
        assertThat(result.getSubject()).isEqualTo(TEST_SUBJECT);
        assertThat(result.getIssuedAt()).isEqualTo(now);
        assertThat(result.getExpiration()).isEqualTo(expiration);

        then(jwtGenerator).should(times(1)).getJwtParser();
    }

    @Test
    void RefreshToken_파싱_성공() {
        // given
        Date now = new Date();
        Date expiration = new Date(now.getTime() + 604800000);

        Claims mockClaims = mock(Claims.class);
        given(mockClaims.getSubject()).willReturn(TEST_SUBJECT);
        given(mockClaims.getIssuedAt()).willReturn(now);
        given(mockClaims.getExpiration()).willReturn(expiration);

        @SuppressWarnings("unchecked")
        Jws<Claims> mockJws = mock(Jws.class);
        given(mockJws.getPayload()).willReturn(mockClaims);

        JwtParser mockParser = mock(JwtParser.class);
        given(jwtGenerator.getJwtParser()).willReturn(mockParser);
        given(mockParser.parseSignedClaims(anyString())).willReturn(mockJws);

        // when
        RefreshToken result = jwtTokenParser.parseRefreshToken(TEST_TOKEN);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo(TEST_TOKEN);
        assertThat(result.getSubject()).isEqualTo(TEST_SUBJECT);
        assertThat(result.getIssuedAt()).isEqualTo(now);
        assertThat(result.getExpiration()).isEqualTo(expiration);

        then(jwtGenerator).should(times(1)).getJwtParser();
    }

    @Test
    void 잘못된_토큰_파싱_시_예외_발생() {
        // given
        JwtParser mockParser = mock(JwtParser.class);
        given(jwtGenerator.getJwtParser()).willReturn(mockParser);
        given(mockParser.parseSignedClaims(anyString()))
                .willThrow(new JwtException("Invalid token"));

        // when & then
        assertThatThrownBy(() -> jwtTokenParser.parseAccessToken("invalid.token"))
                .isInstanceOf(JwtException.class)
                .hasMessageContaining("Invalid token");

        then(jwtGenerator).should(times(1)).getJwtParser();
    }

    @Test
    void 파싱된_토큰의_모든_Claims가_올바르게_매핑됨() {
        // given
        Date issuedAt = new Date(System.currentTimeMillis() - 1000);
        Date expiration = new Date(System.currentTimeMillis() + 3600000);
        String subject = "user@example.com";

        Claims mockClaims = mock(Claims.class);
        given(mockClaims.getSubject()).willReturn(subject);
        given(mockClaims.getIssuedAt()).willReturn(issuedAt);
        given(mockClaims.getExpiration()).willReturn(expiration);

        @SuppressWarnings("unchecked")
        Jws<Claims> mockJws = mock(Jws.class);
        given(mockJws.getPayload()).willReturn(mockClaims);

        JwtParser mockParser = mock(JwtParser.class);
        given(jwtGenerator.getJwtParser()).willReturn(mockParser);
        given(mockParser.parseSignedClaims(anyString())).willReturn(mockJws);

        // when
        AccessToken result = jwtTokenParser.parseAccessToken(TEST_TOKEN);

        // then
        assertThat(result.getToken()).isEqualTo(TEST_TOKEN);
        assertThat(result.getSubject()).isEqualTo(subject);
        assertThat(result.getIssuedAt()).isEqualTo(issuedAt);
        assertThat(result.getExpiration()).isEqualTo(expiration);
    }
}