package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import static com.jackpot.narratix.global.auth.jwt.service.JwtPrefixExtractor.extractPrefix;

@Component
@RequiredArgsConstructor
public class JwtProvider {

    private final JwtGenerator jwtGenerator;
    private final JwtTokenParser jwtTokenParser;

    public TokenResponse issueToken(String subjectId) {
        return TokenResponse.of(
                jwtGenerator.generateAccessToken(subjectId),
                jwtGenerator.generateRefreshToken(subjectId)
        );
    }

    public RefreshToken reissueToken(String subjectId) {
        return jwtGenerator.generateRefreshToken(subjectId);
    }

    public RefreshToken parseRefreshToken(String rawToken) {
        String extractedToken = extractPrefix(rawToken);
        return jwtTokenParser.parseRefreshToken(extractedToken);
    }
}