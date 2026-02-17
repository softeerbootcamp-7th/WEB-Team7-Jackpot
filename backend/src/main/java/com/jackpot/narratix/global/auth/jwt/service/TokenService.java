package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtGenerator jwtGenerator;
    private final JwtValidator jwtValidator;
    private final JwtTokenParser jwtTokenParser;

    public AccessToken reissueToken(String rawToken) {
        Token token = jwtTokenParser.parseToken(rawToken);
        jwtValidator.validateToken(token);
        String userId = token.getSubject();
        return jwtGenerator.generateAccessToken(userId);
    }

    public TokenResponse issueToken(String subjectId) {
        return TokenResponse.of(
                jwtGenerator.generateAccessToken(subjectId),
                jwtGenerator.generateRefreshToken(subjectId)
        );
    }
}