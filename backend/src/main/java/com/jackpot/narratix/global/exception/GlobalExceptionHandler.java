package com.jackpot.narratix.global.exception;

import com.jackpot.narratix.global.auth.jwt.exception.JwtException;
import com.jackpot.narratix.global.sse.SseException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConversionException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String SSE_ERROR_EVENT_PREFIX = "event: error\ndata: ";
    private static final String SSE_EVENT_SUFFIX = "\n\n";

    @ExceptionHandler(SseException.class)
    protected ResponseEntity<String> handleSseException(SseException e) {
        ErrorCode errorCode = e.getErrorCode();
        log.warn("SSE connection error: {}", errorCode.getMessage());

        return ResponseEntity
                .status(errorCode.getStatus())
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(SSE_ERROR_EVENT_PREFIX + errorCode.getMessage() + SSE_EVENT_SUFFIX); // SSE 이벤트 스트림의 표준 규격에 맞게 에러 메시지 작성
    }

    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    protected ResponseEntity<Void> handleMediaTypeNotAcceptableException(HttpMediaTypeNotAcceptableException e) {
        log.warn("Client requested an unsupported media type: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
    }

    @ExceptionHandler(JwtException.class)
    protected ResponseEntity<ErrorResponse> handleJwtException(JwtException e) {
        ErrorCode errorCode = e.getErrorCode();
        ErrorResponse response = ErrorResponse.of(errorCode);
        // JWT 인증 실패는 정상적인 인증 흐름이므로 로그를 남기지 않음 (ERROR 로그 방지)
        return ResponseEntity.status(errorCode.getStatus()).body(response);
    }

    @ExceptionHandler(BaseException.class)
    protected ResponseEntity<ErrorResponse> handleBaseException(BaseException e) {
        ErrorCode errorCode = e.getErrorCode();
        ErrorResponse response = ErrorResponse.of(errorCode);
        return ResponseEntity.status(errorCode.getStatus()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        ErrorResponse response = ErrorResponse.of(GlobalErrorCode.INVALID_INPUT_VALUE, e.getBindingResult());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    protected ResponseEntity<ErrorResponse> handleMissingParameterException(MissingServletRequestParameterException e) {
        log.warn("Missing request parameter: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(GlobalErrorCode.INVALID_INPUT_VALUE);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    protected ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException e) {
        log.warn("Constraint violation occurred: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(GlobalErrorCode.INVALID_INPUT_VALUE);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(HttpMessageConversionException.class)
    protected ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(HttpMessageConversionException e) {
        log.warn("Invalid JSON format or data type: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(GlobalErrorCode.INVALID_INPUT_VALUE);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    protected ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        log.warn("Method not supported: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(GlobalErrorCode.METHOD_NOT_ALLOWED);
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    // 비동기 요청(SSE) 중 연결이 끊겨서 생기는 에러 핸들링
    @ExceptionHandler(AsyncRequestNotUsableException.class)
    public void handleAsyncRequestNotUsableException(AsyncRequestNotUsableException e) {
        log.warn("Async request is not usable: {}", e.getMessage());
        // 이미 응답 채널이 닫혔으므로 아무것도 반환하지 않음 (로그만 남김)
    }

    // SSE 스트림에 JSON 에러 응답을 쓰려다 실패하는 경우를 대비한 핸들러
    @ExceptionHandler(HttpMessageNotWritableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotWritableException(
            HttpMessageNotWritableException e, HttpServletRequest request
    ) {
        String acceptHeader = request.getHeader("Accept");
        boolean isSseRequest = acceptHeader != null && acceptHeader.contains("text/event-stream");
        if (isSseRequest) {
            log.warn("Failed to write SSE response (client likely disconnected): {}", e.getMessage());
            return null; // SSE 연결이 이미 닫힌 경우 응답 불필요
        }
        log.error("Failed to write HTTP response: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        return ResponseEntity.internalServerError().body(response);
    }

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("Unexpected error occurred: ", e);
        ErrorResponse response = ErrorResponse.of(GlobalErrorCode.INTERNAL_SERVER_ERROR);
        return ResponseEntity.internalServerError().body(response);
    }
}

