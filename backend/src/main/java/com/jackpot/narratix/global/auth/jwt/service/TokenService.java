package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtProvider jwtProvider;
    private final JwtValidator jwtValidator;
    private final JwtTokenParser jwtTokenParser;

    public AccessToken reissueToken(String rawToken) {
        Token token = jwtTokenParser.parseToken(rawToken);
        jwtValidator.validateToken(token);
        String userId = token.getSubject();
        return jwtProvider.reissueToken(userId);
    }

    public TokenResponse issueToken(String subjectId) {
        return jwtProvider.issueToken(subjectId);
    }
}