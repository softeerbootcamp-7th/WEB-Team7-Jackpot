package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.enums.WebSocketMessageType;

public record WebSocketMessageResponse(
        WebSocketMessageType type,
        Long qnAId,
        Object payload
) {
}