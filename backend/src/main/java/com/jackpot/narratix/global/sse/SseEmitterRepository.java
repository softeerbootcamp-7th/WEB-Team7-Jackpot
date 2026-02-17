package com.jackpot.narratix.global.sse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
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
        userEmitterIds.computeIfAbsent(userId, key -> ConcurrentHashMap.newKeySet()).add(emitterId);
    }

    public void deleteByEmitterId(String userId, String emitterId) {
        emitters.remove(emitterId);

        userEmitterIds.compute(userId, (key, emitterIds) -> {
            if (emitterIds == null) {
                return null;
            }
            emitterIds.remove(emitterId);
            return emitterIds.isEmpty() ? null : emitterIds;
        });
    }

    public void deleteByEmitterId(String emitterId) {
        emitters.remove(emitterId);

        userEmitterIds.forEach((userId, emitterIds) ->
                userEmitterIds.compute(userId, (key, ids) -> {
                    if (ids == null) {
                        return null;
                    }
                    ids.remove(emitterId);
                    return ids.isEmpty() ? null : ids;
                }));
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

        Map<String, SseEmitter> result = new HashMap<>();
        for (String emitterId : emitterIds) {
            SseEmitter emitter = emitters.get(emitterId);
            if (emitter != null) {
                result.put(emitterId, emitter);
            }
        }
        return result;
    }

    public Map<String, SseEmitter> getAllEmitters() {
        return Map.copyOf(emitters);
    }
}
