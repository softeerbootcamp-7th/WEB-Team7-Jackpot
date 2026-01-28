package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import com.jackpot.narratix.global.auth.jwt.exception.JwtError;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import static com.jackpot.narratix.global.auth.jwt.service.JwtPrefixExtractor.extractPrefix;

@RequiredArgsConstructor
@Component
public class JwtValidator {
    private final JwtTokenParser jwtTokenParser;

    public void validateAccessToken(String rawToken) {
        try {
            String extractedToken = extractPrefix(rawToken);
            AccessToken accessToken = jwtTokenParser.parseAccessToken(extractedToken);

            if (accessToken.isExpired()) {
                throw new JwtException(JwtError.EXPIRED_ACCESS_TOKEN.getErrorMessage());
            }
        } catch (ExpiredJwtException e) {
            throw new JwtException(JwtError.EXPIRED_ACCESS_TOKEN.getErrorMessage());
        } catch (JwtException e) {
            throw e;
        } catch (Exception e) {
            throw new JwtException(JwtError.INVALID_ACCESS_TOKEN.getErrorMessage());
        }
    }

    public void validateRefreshToken(String rawToken) {
        try {
            String extractedToken = extractPrefix(rawToken);
            RefreshToken refreshToken = jwtTokenParser.parseRefreshToken(extractedToken);

            if (refreshToken.isExpired()) {
                throw new JwtException(JwtError.EXPIRED_REFRESH_TOKEN.getErrorMessage());
            }
        } catch (ExpiredJwtException e) {
            throw new JwtException(JwtError.EXPIRED_REFRESH_TOKEN.getErrorMessage());
        } catch (JwtException e) {
            throw e;
        } catch (Exception e) {
            throw new JwtException(JwtError.INVALID_REFRESH_TOKEN.getErrorMessage());
        }
    }
}