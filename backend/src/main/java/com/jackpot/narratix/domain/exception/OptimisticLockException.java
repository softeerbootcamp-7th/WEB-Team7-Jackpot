package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.BaseException;

/**
 * 낙관적 락 충돌 시 발생하는 예외.
 * 재시도 로직에서 이 예외를 catch하여 자동 재시도를 수행한다.
 */
public class OptimisticLockException extends BaseException {

    public OptimisticLockException() {
        super(QnAErrorCode.OPTIMISTIC_LOCK_FAILURE);
    }
}