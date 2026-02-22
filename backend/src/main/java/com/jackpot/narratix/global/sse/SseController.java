package com.jackpot.narratix.global.sse;

import com.jackpot.narratix.global.auth.UserId;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@RestController
@RequestMapping("/api/v1/sse")
@RequiredArgsConstructor
public class SseController implements SseApi {

    private final SseEmitterService sseEmitterService;

    @Override
    @GetMapping(value = "/connect", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect(@UserId String userId) {
        try {
            return sseEmitterService.init(userId);
        } catch (BaseException e) {
            throw new SseException(e.getErrorCode(), e);
        }
    }
}
