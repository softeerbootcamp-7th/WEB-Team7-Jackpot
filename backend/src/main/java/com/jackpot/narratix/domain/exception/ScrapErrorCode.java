package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ScrapErrorCode implements ErrorCode {
    DUPLICATE_SCRAP(HttpStatus.BAD_REQUEST, "이미 스크랩한 문항입니다.");

    private final HttpStatus status;
    private final String message;
}
