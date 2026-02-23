package com.jackpot.narratix.global.sse;

import com.jackpot.narratix.global.exception.BaseException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class SseEmitterServiceTest {

    @Mock
    private SseEmitterRepository sseEmitterRepository;

    @InjectMocks
    private SseEmitterService sseEmitterService;

    private static final String TEST_USER_ID = "testUser123";

    @Test
    void SSE_연결_초기화_성공() {
        // given
        given(sseEmitterRepository.saveIfNotExceedLimit(eq(TEST_USER_ID), any(String.class), any(SseEmitter.class), anyInt()))
                .willReturn(true);

        // when
        SseEmitter result = sseEmitterService.init(TEST_USER_ID);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getTimeout()).isEqualTo(60 * 60 * 1000L);

        ArgumentCaptor<String> emitterIdCaptor = ArgumentCaptor.forClass(String.class);
        then(sseEmitterRepository).should(times(1))
                .saveIfNotExceedLimit(eq(TEST_USER_ID), emitterIdCaptor.capture(), any(SseEmitter.class), anyInt());

        String capturedEmitterId = emitterIdCaptor.getValue();
        assertThat(capturedEmitterId).isNotNull()
                .isNotEmpty();
    }

    @Test
    void 다중_디바이스_연결_시_각각_다른_EmitterId_생성() {
        // given
        given(sseEmitterRepository.saveIfNotExceedLimit(eq(TEST_USER_ID), any(String.class), any(SseEmitter.class), anyInt()))
                .willReturn(true);

        // when
        sseEmitterService.init(TEST_USER_ID);
        sseEmitterService.init(TEST_USER_ID);
        sseEmitterService.init(TEST_USER_ID);

        // then
        ArgumentCaptor<String> emitterIdCaptor = ArgumentCaptor.forClass(String.class);
        then(sseEmitterRepository).should(times(3))
                .saveIfNotExceedLimit(eq(TEST_USER_ID), emitterIdCaptor.capture(), any(SseEmitter.class), anyInt());

        var capturedEmitterIds = emitterIdCaptor.getAllValues();
        assertThat(capturedEmitterIds).hasSize(3)
                        .doesNotHaveDuplicates();
    }

    @Test
    void SSE_연결_시_Repository에_저장() {
        // given
        given(sseEmitterRepository.saveIfNotExceedLimit(eq(TEST_USER_ID), any(String.class), any(SseEmitter.class), anyInt()))
                .willReturn(true);

        // when
        sseEmitterService.init(TEST_USER_ID);

        // then
        then(sseEmitterRepository).should(times(1))
                .saveIfNotExceedLimit(eq(TEST_USER_ID), any(String.class), any(SseEmitter.class), anyInt());
    }

    @Test
    void 여러_사용자의_SSE_연결_독립적으로_처리() {
        // given
        String user1 = "user1";
        String user2 = "user2";

        given(sseEmitterRepository.saveIfNotExceedLimit(eq(user1), any(String.class), any(SseEmitter.class), anyInt()))
                .willReturn(true);
        given(sseEmitterRepository.saveIfNotExceedLimit(eq(user2), any(String.class), any(SseEmitter.class), anyInt()))
                .willReturn(true);

        // when
        SseEmitter emitter1 = sseEmitterService.init(user1);
        SseEmitter emitter2 = sseEmitterService.init(user2);

        // then
        assertThat(emitter1).isNotNull();
        assertThat(emitter2).isNotNull();
        assertThat(emitter1).isNotEqualTo(emitter2);

        then(sseEmitterRepository).should(times(1))
                .saveIfNotExceedLimit(eq(user1), any(String.class), any(SseEmitter.class), anyInt());
        then(sseEmitterRepository).should(times(1))
                .saveIfNotExceedLimit(eq(user2), any(String.class), any(SseEmitter.class), anyInt());
    }

    @Test
    void SSE_연결_한도_초과_시_예외_발생() {
        // given
        given(sseEmitterRepository.saveIfNotExceedLimit(eq(TEST_USER_ID), any(String.class), any(SseEmitter.class), anyInt()))
                .willReturn(false);

        // when & then
        assertThatThrownBy(() -> sseEmitterService.init(TEST_USER_ID))
                .isInstanceOf(BaseException.class);
    }
}