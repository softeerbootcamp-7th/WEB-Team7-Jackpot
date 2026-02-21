package com.jackpot.narratix.domain.exception;

import com.jackpot.narratix.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum UploadErrorCode implements ErrorCode {

    INVALID_CONTENT_TYPE_FOR_PDF(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "PDF만 업로드할 수 있습니다."),
    FILE_SIZE_EXCEEDED(HttpStatus.valueOf(413), "파일 업로드 용량이 초과되었습니다."),
    PRESIGNED_URL_GENERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "S3 업로드 URL 생성에 실패했습니다."),
    LAMBDA_CALL_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Lambda 호출을 실패했습니다."),
    EMPTY_FILE_LIST(HttpStatus.BAD_REQUEST, "파일 리스트가 비었습니다."),
    TOO_MANY_FILES(HttpStatus.BAD_REQUEST, "파일 개수가 너무 많습니다."),
    INVALID_FILE_KEY(HttpStatus.BAD_REQUEST, "유효하지 않는 파일 키 형식입니다."),
    FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다."),
    UPLOAD_JOB_NOT_FOUND(HttpStatus.NOT_FOUND, "Upload Job을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String message;
}
