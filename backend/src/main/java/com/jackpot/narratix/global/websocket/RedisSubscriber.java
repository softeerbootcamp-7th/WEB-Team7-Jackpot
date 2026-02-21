package com.jackpot.narratix.global.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void onMessage(@NonNull Message message, byte[] pattern) {
        try {
            String json = new String(message.getBody(), StandardCharsets.UTF_8);
            RedisWebSocketMessage redisMessage = objectMapper.readValue(json, RedisWebSocketMessage.class);
            messagingTemplate.convertAndSend(redisMessage.destination(), redisMessage.message());
            log.debug("Redis 메시지 STOMP 전달 완료: destination={}", redisMessage.destination());
        } catch (Exception e) {
            log.error("Redis WebSocket 메시지 처리 실패", e);
        }
    }
}