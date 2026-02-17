package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.exception.JwtError;
import com.jackpot.narratix.global.auth.jwt.exception.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class JwtValidator {

    public void validateToken(Token token) {
        try {
            if (token.isExpired()) {
                throw new JwtException(JwtError.EXPIRED_TOKEN);
            }
        } catch (NullPointerException e) {
            throw new JwtException(JwtError.MALFORMED_TOKEN, e);
        } catch (Exception e) {
            throw new JwtException(JwtError.INVALID_TOKEN, e);
        }
    }
}