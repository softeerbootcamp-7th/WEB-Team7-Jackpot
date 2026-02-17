package com.jackpot.narratix.global.auth.jwt.exception;

import com.jackpot.narratix.global.exception.BaseException;

public class JwtException extends BaseException {

    public JwtException(JwtError jwtError) {
        super(jwtError);
    }

    public JwtException(JwtError jwtError, Throwable cause) {
        super(jwtError, cause);
    }
}
