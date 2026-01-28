package com.jackpot.narratix.global.auth.jwt.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum JwtError {

    // 401 UNAUTHORIZED
    INVALID_ACCESS_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 액세스 토큰입니다. 액세스 토큰을 재발급 받아주세요."),
    EXPIRED_ACCESS_TOKEN(HttpStatus.UNAUTHORIZED,  "액세스 토큰이 만료되었습니다. 액세스 토큰을 재발급 받아주세요."),

    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 리프레시 토큰입니다. 다시 로그인 해주세요."),
    EXPIRED_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED,  "리프레시 토큰이 만료되었습니다. 다시 로그인해 주세요.");

    private final HttpStatus status;
    private final String errorMessage;
}