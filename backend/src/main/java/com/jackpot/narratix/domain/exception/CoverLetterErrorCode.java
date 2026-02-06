package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum CoverLetterErrorCode implements ErrorCode {

    COVER_LETTER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 자기소개서를 찾을 수 없습니다."),
    DATE_RANGE_EXCEEDED(HttpStatus.BAD_REQUEST, "조회 기간은 최대 1개월까지만 가능합니다.");

    private final HttpStatus status;
    private final String message;
}
