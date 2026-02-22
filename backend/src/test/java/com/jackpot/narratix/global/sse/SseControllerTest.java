package com.jackpot.narratix.global.sse;

import com.jackpot.narratix.global.auth.jwt.domain.Token;
import com.jackpot.narratix.global.auth.jwt.service.JwtTokenParser;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class SseControllerTest {

    @InjectMocks
    private SseController sseController;

    @Mock
    private SseEmitterService sseEmitterService;

    @Mock
    private JwtTokenParser jwtTokenParser;

    private static final String TEST_USER_ID = "user1234";
    private static final String TEST_BEARER_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

    @Test
    @DisplayName("SSE 연결 성공 시 SseEmitter 반환")
    void connect_Success() {
        // given
        HttpServletRequest mockRequest = mock(HttpServletRequest.class);
        Token mockToken = Token.of(TEST_BEARER_TOKEN, TEST_USER_ID, new Date(), new Date());
        SseEmitter mockEmitter = new SseEmitter(60 * 60 * 1000L);

        given(mockRequest.getHeader(HttpHeaders.AUTHORIZATION)).willReturn(TEST_BEARER_TOKEN);
        given(jwtTokenParser.parseBearerToken(TEST_BEARER_TOKEN)).willReturn(mockToken);
        given(sseEmitterService.init(TEST_USER_ID)).willReturn(mockEmitter);

        // when
        SseEmitter result = sseController.connect(mockRequest);

        // then
        assertThat(result).isNotNull()
                .isEqualTo(mockEmitter);
        then(jwtTokenParser).should(times(1)).parseBearerToken(TEST_BEARER_TOKEN);
        then(sseEmitterService).should(times(1)).init(TEST_USER_ID);
    }
}