package com.jackpot.narratix.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum GlobalErrorCode implements ErrorCode {

    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "잘못된 파라미터 입력 값입니다"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 에러입니다"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 존재하지 않습니다.");

    private final HttpStatus status;
    private final String message;
}
