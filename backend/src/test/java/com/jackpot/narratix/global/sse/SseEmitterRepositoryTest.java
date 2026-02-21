package com.jackpot.narratix.global.sse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.assertj.core.api.Assertions.assertThat;

class SseEmitterRepositoryTest {

    private SseEmitterRepository sseEmitterRepository;

    @BeforeEach
    void setUp() {
        sseEmitterRepository = new SseEmitterRepository();
    }

    @Test
    void Emitter_저장_성공() {
        // given
        String userId = "user123";
        String emitterId = "emitter123";
        SseEmitter emitter = new SseEmitter();

        // when
        sseEmitterRepository.save(userId, emitterId, emitter);

        // then
        assertThat(sseEmitterRepository.countByUserId(userId)).isEqualTo(1);
    }

    @Test
    void 다중_디바이스_연결_지원() {
        // given
        String userId = "user123";
        String emitterId1 = "device1_emitter";
        String emitterId2 = "device2_emitter";
        String emitterId3 = "device3_emitter";
        SseEmitter emitter1 = new SseEmitter();
        SseEmitter emitter2 = new SseEmitter();
        SseEmitter emitter3 = new SseEmitter();

        // when
        sseEmitterRepository.save(userId, emitterId1, emitter1);
        sseEmitterRepository.save(userId, emitterId2, emitter2);
        sseEmitterRepository.save(userId, emitterId3, emitter3);

        // then
        assertThat(sseEmitterRepository.countByUserId(userId)).isEqualTo(3);
    }

    @Test
    void EmitterId로_Emitter_삭제_성공() {
        // given
        String userId = "user123";
        String emitterId = "emitter123";
        SseEmitter emitter = new SseEmitter();
        sseEmitterRepository.save(userId, emitterId, emitter);

        // when
        sseEmitterRepository.deleteByEmitterId(userId, emitterId);

        // then
        assertThat(sseEmitterRepository.countByUserId(userId)).isZero();
    }

    @Test
    void 다중_연결_중_하나만_삭제() {
        // given
        String userId = "user123";
        String emitterId1 = "emitter1";
        String emitterId2 = "emitter2";
        SseEmitter emitter1 = new SseEmitter();
        SseEmitter emitter2 = new SseEmitter();
        sseEmitterRepository.save(userId, emitterId1, emitter1);
        sseEmitterRepository.save(userId, emitterId2, emitter2);

        // when
        sseEmitterRepository.deleteByEmitterId(userId, emitterId1);

        // then
        assertThat(sseEmitterRepository.countByUserId(userId)).isEqualTo(1);
    }

    @Test
    void 마지막_Emitter_삭제_시_UserId도_제거() {
        // given
        String userId = "user123";
        String emitterId = "emitter123";
        SseEmitter emitter = new SseEmitter();
        sseEmitterRepository.save(userId, emitterId, emitter);

        // when
        sseEmitterRepository.deleteByEmitterId(userId, emitterId);

        // then
        assertThat(sseEmitterRepository.countByUserId(userId)).isZero();
    }

    @Test
    void 존재하지_않는_Emitter_삭제_시도() {
        // given
        String userId = "user123";
        String nonExistentEmitterId = "nonExistent";

        // when & then - 예외 발생하지 않음
        sseEmitterRepository.deleteByEmitterId(userId, nonExistentEmitterId);
    }

    @Test
    void 여러_사용자의_Emitter_독립적으로_관리() {
        // given
        String user1 = "user1";
        String user2 = "user2";
        String emitterId1 = "emitter1";
        String emitterId2 = "emitter2";
        SseEmitter emitter1 = new SseEmitter();
        SseEmitter emitter2 = new SseEmitter();

        // when
        sseEmitterRepository.save(user1, emitterId1, emitter1);
        sseEmitterRepository.save(user2, emitterId2, emitter2);

        // then
        assertThat(sseEmitterRepository.countByUserId(user1)).isEqualTo(1);
        assertThat(sseEmitterRepository.countByUserId(user2)).isEqualTo(1);
    }

    @Test
    void 연결이_없는_사용자의_Count는_0() {
        // given
        String userId = "nonExistentUser";

        // when
        int count = sseEmitterRepository.countByUserId(userId);

        // then
        assertThat(count).isZero();
    }
}