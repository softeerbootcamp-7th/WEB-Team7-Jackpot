package com.jackpot.narratix.global.sse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseEmitterRepository {

    // emitterId -> SseEmitter
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    // userId -> Set<emitterId>
    private final Map<String, Set<String>> userEmitterIds = new ConcurrentHashMap<>();

    public void save(String userId, String emitterId, SseEmitter emitter) {
        emitters.put(emitterId, emitter);
        userEmitterIds.computeIfAbsent(userId, key -> ConcurrentHashMap.newKeySet())
                .add(emitterId);
    }

    public void deleteByEmitterId(String userId, String emitterId) {
        emitters.remove(emitterId);

        Set<String> emitterIds = userEmitterIds.get(userId);
        if (emitterIds != null) {
            emitterIds.remove(emitterId);
            if (emitterIds.isEmpty()) {
                userEmitterIds.remove(userId);
            }
        }
    }

    public int countByUserId(String userId) {
        Set<String> emitterIds = userEmitterIds.get(userId);
        return emitterIds != null ? emitterIds.size() : 0;
    }
}
