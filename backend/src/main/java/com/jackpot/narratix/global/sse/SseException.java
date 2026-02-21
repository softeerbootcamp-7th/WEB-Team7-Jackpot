package com.jackpot.narratix.global.sse;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.Getter;

@Getter
public class SseException extends RuntimeException {

    private final ErrorCode errorCode;

    public SseException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public SseException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}