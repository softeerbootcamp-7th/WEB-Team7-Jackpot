package com.jackpot.narratix.domain.exception;

public class AiLabelingException extends RuntimeException {
    public AiLabelingException(String message) {
        super(message);
    }

    public AiLabelingException(String message, Throwable cause) {
        super(message, cause);
    }
}
