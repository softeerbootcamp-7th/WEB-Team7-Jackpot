package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum LibraryErrorCode implements ErrorCode {
    INVALID_LIBRARY_TYPE(HttpStatus.BAD_REQUEST, "잘못된 타입입니다.");

    private final HttpStatus status;
    private final String message;
}
