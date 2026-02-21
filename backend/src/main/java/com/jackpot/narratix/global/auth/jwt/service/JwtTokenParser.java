package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.JwtConstants;
import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.exception.JwtError;
import com.jackpot.narratix.global.auth.jwt.exception.JwtException;
import io.jsonwebtoken.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class JwtTokenParser {

    private final JwtKeyProvider jwtKeyProvider;

    public Token parseJwtToken(String rawToken) {
        Claims claims = parseClaims(rawToken);
        return Token.of(
                rawToken,
                claims.getSubject(),
                claims.getIssuedAt(),
                claims.getExpiration()
        );
    }

    public Token parseBearerToken(String rawToken) {
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
            throw new JwtException(JwtError.EXPIRED_TOKEN, e);
        } catch (io.jsonwebtoken.JwtException e) {
            throw new JwtException(JwtError.INVALID_TOKEN, e);
        } catch (Exception e) {
            throw new JwtException(JwtError.MALFORMED_TOKEN, e);
        }
    }

    private String extractPrefix(String accessToken) {
        if (accessToken == null) {
            throw new JwtException(JwtError.MALFORMED_TOKEN);
        }
        accessToken = accessToken.trim();
        if (StringUtils.hasText(accessToken) && accessToken.startsWith(JwtConstants.BEARER)) {
            return accessToken.substring(JwtConstants.BEARER.length());
        }
        throw new JwtException(JwtError.MALFORMED_TOKEN);
    }
}