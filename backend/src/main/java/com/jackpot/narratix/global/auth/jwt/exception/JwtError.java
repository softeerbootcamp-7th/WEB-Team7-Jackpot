package com.jackpot.narratix.global.auth.jwt.exception;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum JwtError implements ErrorCode {

    // 401 UNAUTHORIZED
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다. 토큰을 재발급 받아주세요."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다. 다시 로그인해 주세요."),
    MALFORMED_TOKEN(HttpStatus.UNAUTHORIZED, "토큰 형식이 잘못되었습니다.");

    private final HttpStatus status;
    private final String message;
}