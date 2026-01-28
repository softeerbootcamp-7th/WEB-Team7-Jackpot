package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtProvider {

    private final JwtGenerator jwtGenerator;

    public TokenResponse issueToken(String subjectId) {
        return TokenResponse.of(
                jwtGenerator.generateAccessToken(subjectId),
                jwtGenerator.generateRefreshToken(subjectId)
        );
    }

    public AccessToken reissueToken(String subjectId) {
        return jwtGenerator.generateAccessToken(subjectId);
    }
}