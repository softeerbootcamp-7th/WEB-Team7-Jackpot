package com.jackpot.narratix.global.sse;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum SseErrorCode implements ErrorCode {

    SSE_CONNECTION_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, "유저 당 SSE Connection 개수가 제한을 초과했습니다.");

    private final HttpStatus status;
    private final String message;
}
