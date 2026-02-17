package com.jackpot.narratix.global.exception;

import org.springframework.http.HttpStatus;

import java.io.Serializable;

public interface ErrorCode extends Serializable {

    HttpStatus getStatus();

    String getMessage();
}
