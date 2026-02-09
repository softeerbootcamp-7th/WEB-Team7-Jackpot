package com.jackpot.narratix.global.sse;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
        given(sseEmitterRepository.countByUserId(TEST_USER_ID)).willReturn(1);

        // when
        SseEmitter result = sseEmitterService.init(TEST_USER_ID);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getTimeout()).isEqualTo(60 * 60 * 1000L);

        ArgumentCaptor<String> emitterIdCaptor = ArgumentCaptor.forClass(String.class);
        then(sseEmitterRepository).should(times(1))
                .save(eq(TEST_USER_ID), emitterIdCaptor.capture(), any(SseEmitter.class));

        String capturedEmitterId = emitterIdCaptor.getValue();
        assertThat(capturedEmitterId).isNotNull()
                .isNotEmpty();
    }

    @Test
    void 다중_디바이스_연결_시_각각_다른_EmitterId_생성() {
        // given
        given(sseEmitterRepository.countByUserId(TEST_USER_ID))
                .willReturn(1)
                .willReturn(2)
                .willReturn(3);

        // when
        sseEmitterService.init(TEST_USER_ID);
        sseEmitterService.init(TEST_USER_ID);
        sseEmitterService.init(TEST_USER_ID);

        // then
        ArgumentCaptor<String> emitterIdCaptor = ArgumentCaptor.forClass(String.class);
        then(sseEmitterRepository).should(times(3))
                .save(eq(TEST_USER_ID), emitterIdCaptor.capture(), any(SseEmitter.class));

        var capturedEmitterIds = emitterIdCaptor.getAllValues();
        assertThat(capturedEmitterIds).hasSize(3);
        assertThat(capturedEmitterIds.get(0)).isNotEqualTo(capturedEmitterIds.get(1));
        assertThat(capturedEmitterIds.get(1)).isNotEqualTo(capturedEmitterIds.get(2));
        assertThat(capturedEmitterIds.get(0)).isNotEqualTo(capturedEmitterIds.get(2));
    }

    @Test
    void SSE_연결_시_Repository에_저장() {
        // given
        given(sseEmitterRepository.countByUserId(TEST_USER_ID)).willReturn(1);

        // when
        sseEmitterService.init(TEST_USER_ID);

        // then
        then(sseEmitterRepository).should(times(1))
                .save(eq(TEST_USER_ID), any(String.class), any(SseEmitter.class));
    }

    @Test
    void 여러_사용자의_SSE_연결_독립적으로_처리() {
        // given
        String user1 = "user1";
        String user2 = "user2";

        given(sseEmitterRepository.countByUserId(user1)).willReturn(1);
        given(sseEmitterRepository.countByUserId(user2)).willReturn(1);

        // when
        SseEmitter emitter1 = sseEmitterService.init(user1);
        SseEmitter emitter2 = sseEmitterService.init(user2);

        // then
        assertThat(emitter1).isNotNull();
        assertThat(emitter2).isNotNull();
        assertThat(emitter1).isNotEqualTo(emitter2);

        then(sseEmitterRepository).should(times(1))
                .save(eq(user1), any(String.class), any(SseEmitter.class));
        then(sseEmitterRepository).should(times(1))
                .save(eq(user2), any(String.class), any(SseEmitter.class));
    }

    @Test
    void SSE_연결_시_countByUserId_호출() {
        // given
        given(sseEmitterRepository.countByUserId(TEST_USER_ID)).willReturn(2);

        // when
        sseEmitterService.init(TEST_USER_ID);

        // then
        then(sseEmitterRepository).should(times(1)).countByUserId(TEST_USER_ID);
    }
}