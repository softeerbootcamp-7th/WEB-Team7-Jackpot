package com.jackpot.narratix.global.sse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SseEmitterService {

    private static final Long DEFAULT_TIMEOUT = 60 * 60 * 1000L; // 1시간
    private final SseEmitterRepository sseEmitterRepository;

    public SseEmitter init(String userId) {
        String emitterId = generateRandomEmitterId();
        SseEmitter sseEmitter = new SseEmitter(DEFAULT_TIMEOUT);
        sseEmitterRepository.save(userId, emitterId, sseEmitter);

        int connectionCount = sseEmitterRepository.countByUserId(userId);
        log.info("SSE connected: userId={}, emitterId={}, totalConnections={}", userId, emitterId, connectionCount);

        sseEmitter.onCompletion(() -> {
            sseEmitterRepository.deleteByEmitterId(userId, emitterId);
            log.info("SSE connection completed: userId={}, emitterId={}", userId, emitterId);
        });
        sseEmitter.onTimeout(() -> {
            sseEmitterRepository.deleteByEmitterId(userId, emitterId);
            sseEmitter.complete();
            log.warn("SSE connection timeout: userId={}, emitterId={}", userId, emitterId);
        });
        sseEmitter.onError(e -> {
            sseEmitterRepository.deleteByEmitterId(userId, emitterId);
            sseEmitter.complete();
            log.error("SSE connection error: userId={}, emitterId={}, error={}", userId, emitterId, e.getMessage());
        });

        sendInitialMessage(userId, emitterId, sseEmitter);

        return sseEmitter;
    }

    private String generateRandomEmitterId() {
        return UUID.randomUUID().toString();
    }

    private void sendInitialMessage(String userId, String emitterId, SseEmitter sseEmitter) {
        try {
            sseEmitter.send(
                    SseEmitter.event()
                            .name("init")
                            .data("SSE connected. [userId=" + userId + ", emitterId=" + emitterId + "]")
            );
        } catch (IOException e) {
            log.warn("SSE send initial event failed: userId={}, emitterId={}, reason={}", userId, emitterId, e.getMessage());
            sseEmitterRepository.deleteByEmitterId(userId, emitterId);
            sseEmitter.complete();
        }
    }
}
