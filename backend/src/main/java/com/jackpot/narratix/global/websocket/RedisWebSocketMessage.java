package com.jackpot.narratix.global.websocket;

import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;

public record RedisWebSocketMessage(
        String destination,
        WebSocketMessageResponse message
) {
}