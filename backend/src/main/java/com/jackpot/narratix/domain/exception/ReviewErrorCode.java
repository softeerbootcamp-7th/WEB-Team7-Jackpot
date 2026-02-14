package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ReviewErrorCode implements ErrorCode {

    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 첨삭 댓글을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String message;
}
