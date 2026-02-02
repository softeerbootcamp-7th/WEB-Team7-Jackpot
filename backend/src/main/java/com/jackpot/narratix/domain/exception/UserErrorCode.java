package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum UserErrorCode implements ErrorCode {

    DUPLICATE_USER_ID(HttpStatus.BAD_REQUEST, "이미 사용 중인 아이디입니다."),
    PASSWORD_MISMATCH(HttpStatus.BAD_REQUEST, "비밀번호가 일치하지 않습니다."),

    INVALID_LOGIN(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 일치하지 않습니다.");

    private final HttpStatus status;
    private final String message;
}
