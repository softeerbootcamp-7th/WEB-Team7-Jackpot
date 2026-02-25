package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum QnAErrorCode implements ErrorCode {

    QNA_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 QnA를 찾을 수 없습니다."),
    NOT_SAME_COVERLETTER(HttpStatus.BAD_REQUEST, "하나의 자기소개서에서의 QnA 목록이 아닙니다."),
    OPTIMISTIC_LOCK_FAILURE(HttpStatus.CONFLICT, "답변 버전이 일치하지 않습니다. (내부 재시도용)");


    private final HttpStatus status;
    private final String message;
}
