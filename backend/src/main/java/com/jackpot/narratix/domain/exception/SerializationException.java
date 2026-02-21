package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.BaseException;

public class SerializationException extends BaseException {
    public SerializationException(Throwable cause) {
        super(WebSocketErrorCode.TEXT_UPDATE_REQUEST_SERIALIZE_FAILURE, cause);
    }
}
