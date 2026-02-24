package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum SearchErrorCode implements ErrorCode {

    INVALID_SEARCH_KEYWORD(HttpStatus.BAD_REQUEST, "검색어는 2자 이상이어야 합니다.");

    private final HttpStatus status;
    private final String message;

}
