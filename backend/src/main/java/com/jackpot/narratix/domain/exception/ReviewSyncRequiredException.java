package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.ErrorCode;

public class ReviewSyncRequiredException extends BaseException {
    private final Long qnAId;

    public ReviewSyncRequiredException(ErrorCode errorCode, Long qnAId) {
        super(errorCode);
        this.qnAId = qnAId;
    }

    public Long getQnAId() {
        return qnAId;
    }
}