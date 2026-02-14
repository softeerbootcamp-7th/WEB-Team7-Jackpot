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
        userEmitterIds.computeIfAbsent(userId, key -> ConcurrentHashMap.newKeySet())
                .add(emitterId);
        emitters.put(emitterId, emitter);
    }

    public void deleteByEmitterId(String userId, String emitterId) {
        emitters.remove(emitterId);

        userEmitterIds.compute(userId, (key, emitterIds) -> {
            if(emitterIds == null){
                return null;
            }
            emitterIds.remove(emitterId);
            return emitterIds.isEmpty() ? null : emitterIds;
        });
    }

    public int countByUserId(String userId) {
        Set<String> emitterIds = userEmitterIds.get(userId);
        return emitterIds != null ? emitterIds.size() : 0;
    }

    public Map<String, SseEmitter> findAllByUserId(String userId) {
        Set<String> emitterIds = userEmitterIds.get(userId);
        if (emitterIds == null || emitterIds.isEmpty()) {
            return Map.of();
        }

        Map<String, SseEmitter> result = new ConcurrentHashMap<>();
        for (String emitterId : emitterIds) {
            SseEmitter emitter = emitters.get(emitterId);
            if (emitter != null) {
                result.put(emitterId, emitter);
            }
        }
        return result;
    }
}
