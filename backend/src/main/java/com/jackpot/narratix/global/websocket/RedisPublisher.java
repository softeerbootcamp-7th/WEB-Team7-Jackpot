package com.jackpot.narratix.global.websocket;

import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisPublisher {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ChannelTopic webSocketChannelTopic;
    private final ObjectMapper objectMapper;

    public void publish(String destination, WebSocketMessageResponse message) {
        try {
            String json = objectMapper.writeValueAsString(new RedisWebSocketMessage(destination, message));
            redisTemplate.convertAndSend(webSocketChannelTopic.getTopic(), json);
            log.debug("Redis 메시지 발행 완료: destination={}", destination);
        } catch (JacksonException e) {
            log.error("WebSocket 메시지 직렬화 실패: destination={}", destination, e);
            throw new RuntimeException("Redis WebSocket 메시지 직렬화에 실패했습니다.", e);
        } catch (Exception e) {
            log.error("Redis 메시지 발행 실패: destination={}", destination, e);
            throw new RuntimeException("Redis WebSocket 메시지 발행에 실패했습니다.", e);
        }
    }
}