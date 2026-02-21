package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ShareLinkErrorCode implements ErrorCode {

    SHARE_LINK_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 첨삭 링크를 찾을 수 없습니다."),
    SHARE_LINK_EXPIRED(HttpStatus.GONE, "첨삭 링크가 만료되었습니다."),
    SHARE_LINK_ACCESS_LIMIT_EXCEEDED(HttpStatus.CONFLICT, "첨삭 링크에 접근 가능한 인원 수가 초과되었습니다.")
    ;

    private final HttpStatus status;
    private final String message;
}
