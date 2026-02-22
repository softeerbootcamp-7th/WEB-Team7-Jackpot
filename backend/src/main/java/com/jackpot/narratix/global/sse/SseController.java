package com.jackpot.narratix.global.sse;

import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.service.JwtTokenParser;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
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
    private final JwtTokenParser jwtTokenParser;

    @Override
    @GetMapping(value = "/connect", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect(HttpServletRequest request) {
        try {
            // JWT 추출 및 파싱을 try 블록 안에서 수행
            String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            Token token = jwtTokenParser.parseBearerToken(authorizationHeader);
            String userId = token.getSubject();

            return sseEmitterService.init(userId);
        } catch (BaseException e) {
            throw new SseException(e.getErrorCode(), e);
        } catch (Exception e) {
            throw new SseException(GlobalErrorCode.INTERNAL_SERVER_ERROR, e);
        }
    }
}
