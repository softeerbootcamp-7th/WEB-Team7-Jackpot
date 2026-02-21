package com.jackpot.narratix.global.websocket;

import com.jackpot.narratix.global.auth.jwt.exception.JwtException;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.StompSubProtocolErrorHandler;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class GlobalStompErrorHandler extends StompSubProtocolErrorHandler {

    @Override
    public Message<byte[]> handleClientMessageProcessingError(
            Message<byte[]> clientMessage,
            @NonNull Throwable ex
    ) {
        // JWT 예외는 예상 가능한 시나리오이므로 간단한 WARN 로그만 출력
        if (ex.getCause() instanceof JwtException jwtException) {
            return handleBaseException(clientMessage, jwtException);
        }

        // 기타 BaseException 처리
        if (ex.getCause() instanceof BaseException baseException) {
            return handleBaseException(clientMessage, baseException);
        }

        // 기타 예외 처리
        log.error("STOMP error occurred", ex);
        return handleGenericException(clientMessage, ex);
    }

    private Message<byte[]> handleBaseException(Message<byte[]> clientMessage, BaseException ex) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.ERROR);
        StompHeaderAccessor clientAccessor = copyClientHeaders(clientMessage, accessor);

        accessor.setMessage(ex.getErrorCode().getMessage());
        accessor.setNativeHeader("error-code", String.valueOf(ex.getErrorCode().getStatus().value()));
        accessor.setLeaveMutable(true);

        String errorMessage = ex.getErrorCode().getMessage();
        byte[] payload = errorMessage.getBytes(StandardCharsets.UTF_8);

        log.warn("Sending STOMP ERROR to client: code={}, message={}, destination={}",
                 ex.getErrorCode().getStatus().value(), errorMessage, clientAccessor.getDestination());

        return MessageBuilder.createMessage(payload, accessor.getMessageHeaders());
    }

    private Message<byte[]> handleGenericException(Message<byte[]> clientMessage, Throwable ex) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.ERROR);
        StompHeaderAccessor clientAccessor = copyClientHeaders(clientMessage, accessor);

        String errorMessage = ex.getCause() != null
                ? ex.getCause().getMessage()
                : ex.getMessage();

        accessor.setMessage("WebSocket 처리 중 오류가 발생했습니다.");
        accessor.setNativeHeader("error-code", "500");
        accessor.setLeaveMutable(true);

        byte[] payload = errorMessage != null
                ? errorMessage.getBytes(StandardCharsets.UTF_8)
                : "Internal Server Error".getBytes(StandardCharsets.UTF_8);

        log.error("Sending STOMP ERROR to client: message={}, destination={}",
                  errorMessage, clientAccessor.getDestination());

        return MessageBuilder.createMessage(payload, accessor.getMessageHeaders());
    }

    private StompHeaderAccessor copyClientHeaders(Message<byte[]> clientMessage, StompHeaderAccessor errorAccessor) {
        StompHeaderAccessor clientAccessor = StompHeaderAccessor.wrap(clientMessage);

        if (clientAccessor.getReceipt() != null) { // 수신 확인 ID 정보
            errorAccessor.setReceiptId(clientAccessor.getReceipt());
        }
        if (clientAccessor.getDestination() != null) { // 구독, 발행 주소
            errorAccessor.setDestination(clientAccessor.getDestination());
        }

        return clientAccessor;
    }

    @Override
    protected Message<byte[]> handleInternal(
            @NonNull StompHeaderAccessor errorHeaderAccessor,
            byte @NonNull [] errorPayload,
            Throwable cause,
            StompHeaderAccessor clientHeaderAccessor
    ) {
        log.error("STOMP internal error: {}", new String(errorPayload, StandardCharsets.UTF_8), cause);
        return super.handleInternal(errorHeaderAccessor, errorPayload, cause, clientHeaderAccessor);
    }
}