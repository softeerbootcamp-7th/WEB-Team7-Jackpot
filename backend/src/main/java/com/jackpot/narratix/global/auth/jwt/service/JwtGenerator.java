package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import io.jsonwebtoken.Jwts;
import java.util.Date;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtGenerator {

    private final JwtKeyProvider jwtKeyProvider;

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
                .signWith(jwtKeyProvider.getKey())
                .compact();
    }

    private Date generateExpirationDate(boolean isRefreshToken, Date now) {
        return new Date(now.getTime() + calculateExpirationTime(isRefreshToken));
    }


    private long calculateExpirationTime(boolean isRefreshToken) {
        if (isRefreshToken) {
            return REFRESH_TOKEN_EXPIRATION_TIME;
        }
        return ACCESS_TOKEN_EXPIRATION_TIME;
    }
}