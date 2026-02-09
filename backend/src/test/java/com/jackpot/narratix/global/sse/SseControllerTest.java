package com.jackpot.narratix.global.sse;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class SseControllerTest {

    @InjectMocks
    private SseController sseController;

    @Mock
    private SseEmitterService sseEmitterService;

    private static final String TEST_USER_ID = "user1234";

    @Test
    @DisplayName("SSE 연결 성공 시 SseEmitter 반환")
    void connect_Success() {
        // given
        SseEmitter mockEmitter = new SseEmitter(60 * 60 * 1000L);
        given(sseEmitterService.init(TEST_USER_ID)).willReturn(mockEmitter);

        // when
        SseEmitter result = sseController.connect(TEST_USER_ID);

        // then
        assertThat(result).isNotNull()
                .isEqualTo(mockEmitter);
        then(sseEmitterService).should(times(1)).init(TEST_USER_ID);
    }
}