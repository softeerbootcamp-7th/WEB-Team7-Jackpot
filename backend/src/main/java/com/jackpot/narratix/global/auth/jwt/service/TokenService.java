package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtProvider jwtProvider;
    private final JwtValidator jwtValidator;

    public RefreshToken reissueToken(String rawRefreshToken) {
        jwtValidator.validateRefreshToken(rawRefreshToken);
        RefreshToken refreshToken = jwtProvider.parseRefreshToken(rawRefreshToken);
        String userId = refreshToken.getSubject();
        return jwtProvider.reissueToken(userId);
    }

    public TokenResponse issueToken(String subjectId) {
        return jwtProvider.issueToken(subjectId);
    }
}