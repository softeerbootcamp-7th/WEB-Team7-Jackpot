package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.exception.JwtError;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class JwtValidator {

    public void validateToken(Token token) {
        try {
            if (token.isExpired()) {
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