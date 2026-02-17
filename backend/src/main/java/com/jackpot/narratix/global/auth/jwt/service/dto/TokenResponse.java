package com.jackpot.narratix.global.auth.jwt.service.dto;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class TokenResponse {

    private final String accessToken;
    private final String refreshToken;

    public static TokenResponse of(AccessToken accessToken, RefreshToken refreshToken) {
        return new TokenResponse(accessToken.getToken(), refreshToken.getToken());
    }
}