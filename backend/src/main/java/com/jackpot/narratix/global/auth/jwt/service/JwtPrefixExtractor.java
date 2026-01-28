package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.JwtConstants;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class JwtPrefixExtractor {

    public static String extractPrefix(String accessToken) {
        if (StringUtils.hasText(accessToken) && accessToken.startsWith(JwtConstants.BEARER)) {
            return accessToken.substring(JwtConstants.BEARER.length());
        }
        // TODO: 커스텀 예외 처리 추가
        throw new IllegalArgumentException();
    }
}