package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import javax.crypto.SecretKey;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtGenerator {

    @Value("${jwt.secret}")
    private String JWT_SECRET;
    @Value("${jwt.access-token-expiration-time}")
    private Long ACCESS_TOKEN_EXPIRATION_TIME;
    @Value("${jwt.refresh-token-expiration-time}")
    private Long REFRESH_TOKEN_EXPIRATION_TIME;

    public RefreshToken generateRefreshToken(String subjectId) {
        final Date now = new Date();
        final Date expiration = generateExpirationDate(true, now);
        final String token = buildToken(subjectId, now, expiration);

        return RefreshToken.of(token, subjectId, now, expiration);
    }

    public AccessToken generateAccessToken(String subjectId) {
        final Date now = new Date();
        final Date expiration = generateExpirationDate(false, now);
        final String token = buildToken(subjectId, now, expiration);

        return AccessToken.of(token, subjectId, now, expiration);
    }

    private String buildToken(String subjectId, Date issuedAt, Date expiration) {
        return Jwts.builder()
                .subject(subjectId)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }

    private Date generateExpirationDate(boolean isRefreshToken, Date now) {
        return new Date(now.getTime() + calculateExpirationTime(isRefreshToken));
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(encodeSecretKey().getBytes());
    }

    private long calculateExpirationTime(boolean isRefreshToken) {
        if (isRefreshToken) {
            return REFRESH_TOKEN_EXPIRATION_TIME;
        }
        return ACCESS_TOKEN_EXPIRATION_TIME;
    }

    private String encodeSecretKey() {
        return Base64.getEncoder()
                .encodeToString(JWT_SECRET.getBytes(StandardCharsets.UTF_8));
    }
}