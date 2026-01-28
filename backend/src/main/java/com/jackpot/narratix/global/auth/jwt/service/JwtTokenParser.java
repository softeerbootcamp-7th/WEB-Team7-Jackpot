package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtTokenParser {

    private final JwtGenerator jwtGenerator;

    public AccessToken parseAccessToken(String rawToken) {
        Claims claims = parseClaims(rawToken);
        return AccessToken.of(
                rawToken,
                claims.getSubject(),
                claims.getIssuedAt(),
                claims.getExpiration()
        );
    }

    public RefreshToken parseRefreshToken(String rawToken) {
        Claims claims = parseClaims(rawToken);
        return RefreshToken.of(
                rawToken,
                claims.getSubject(),
                claims.getIssuedAt(),
                claims.getExpiration()
        );
    }

    private Claims parseClaims(String rawToken) {
        JwtParser jwtParser = jwtGenerator.getJwtParser();
        return jwtParser.parseSignedClaims(rawToken)
                .getPayload();
    }
}