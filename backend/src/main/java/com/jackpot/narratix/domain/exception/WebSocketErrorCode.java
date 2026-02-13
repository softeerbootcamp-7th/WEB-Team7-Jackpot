package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum WebSocketErrorCode implements ErrorCode {

    SHARE_ID_MISMATCH(HttpStatus.BAD_REQUEST, "세션에 저장된 shareId와 경로의 shareId가 일치하지 않습니다."),
    ROLE_MISMATCH(HttpStatus.BAD_REQUEST, "세션에 저장된 role과 구독한 role이 일치하지 않습니다."),
    ROLE_NOT_FOUND(HttpStatus.BAD_REQUEST, "Role이 존재하지 않습니다."),
    INVALID_SESSION(HttpStatus.BAD_REQUEST, "유효하지 않은 세션입니다."),
    UNAUTHORIZED_TEXT_UPDATE(HttpStatus.FORBIDDEN, "텍스트 수정 권한이 없습니다. Writer만 수정할 수 있습니다.");

    private final HttpStatus status;
    private final String message;
}
