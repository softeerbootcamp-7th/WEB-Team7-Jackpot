package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.BaseException;

public class VersionConflictException extends BaseException {

    public VersionConflictException() {
        super(WebSocketErrorCode.VERSION_CONFLICT);
    }
}