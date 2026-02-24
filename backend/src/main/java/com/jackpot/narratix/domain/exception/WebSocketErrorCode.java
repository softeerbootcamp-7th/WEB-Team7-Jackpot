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
    UNAUTHORIZED_TEXT_UPDATE(HttpStatus.FORBIDDEN, "텍스트 수정 권한이 없습니다. Writer만 수정할 수 있습니다."),
    VERSION_CONFLICT(HttpStatus.CONFLICT, "클라이언트 버전이 서버 버전과 일치하지 않습니다."),
    TEXT_UPDATE_REQUEST_SERIALIZE_FAILURE(HttpStatus.BAD_REQUEST, "텍스트 업데이트 요청 직렬화에 실패했습니다."),

    SESSION_ATTRIBUTES_NOT_FOUND(HttpStatus.BAD_REQUEST, "웹소켓 세션에서 세션 속성이 존재하지 않습니다."),
    ROLE_NOT_FOUND(HttpStatus.BAD_REQUEST, "웹소켓 세션에서 Role이 존재하지 않습니다."),
    USER_ID_NOT_FOUND(HttpStatus.BAD_REQUEST, "웹소켓 세션에서 유저 아이디가 존재하지 않습니다."),
    SHARE_ID_NOT_FOUND(HttpStatus.BAD_REQUEST, "웹소켓 세션에서 첨삭 링크가 존재하지 않습니다.");

    private final HttpStatus status;
    private final String message;
}
