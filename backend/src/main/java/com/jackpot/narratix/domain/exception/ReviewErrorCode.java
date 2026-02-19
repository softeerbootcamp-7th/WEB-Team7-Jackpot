package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ReviewErrorCode implements ErrorCode {

    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 첨삭 댓글을 찾을 수 없습니다."),
    REVIEW_NOT_BELONGS_TO_QNA(HttpStatus.BAD_REQUEST, "해당 첨삭 댓글은 해당 질문에 속하지 않습니다."),
    REVIEW_SUGGEST_IS_NULL(HttpStatus.BAD_REQUEST, "해당 첨삭 댓글은 Suggest 내용이 없습니다."),
    REVIEW_TEXT_MISMATCH(HttpStatus.CONFLICT, "현재 텍스트가 리뷰 대상 텍스트와 일치하지 않습니다."),
    REVIEW_VERSION_TOO_OLD(HttpStatus.CONFLICT, "버전 이력이 너무 오래되어 OT 변환이 불가합니다."),
    REVIEW_VERSION_AHEAD(HttpStatus.BAD_REQUEST, "Reviewer의 버전이 현재 서버 버전보다 앞서 있습니다.");

    private final HttpStatus status;
    private final String message;
}
