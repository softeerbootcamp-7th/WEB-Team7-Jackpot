package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.JwtConstants;
import com.jackpot.narratix.global.auth.jwt.domain.Token;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class JwtTokenParser {

    private final JwtKeyProvider jwtKeyProvider;

    public Token parseToken(String rawToken) {
        String token = extractPrefix(rawToken);
        Claims claims = parseClaims(token);
        return Token.of(
                rawToken,
                claims.getSubject(),
                claims.getIssuedAt(),
                claims.getExpiration()
        );
    }

    private Claims parseClaims(String rawToken) {
        try {
            return Jwts.parser()
                    .verifyWith(jwtKeyProvider.getKey())
                    .build()
                    .parseSignedClaims(rawToken)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }
    }

    private String extractPrefix(String accessToken) {
        if (StringUtils.hasText(accessToken) && accessToken.startsWith(JwtConstants.BEARER)) {
            return accessToken.substring(JwtConstants.BEARER.length());
        }
        // TODO: 커스텀 예외 처리 추가
        throw new IllegalArgumentException();
    }
}