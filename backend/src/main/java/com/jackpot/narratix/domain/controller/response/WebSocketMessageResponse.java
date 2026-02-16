package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.entity.enums.WebSocketMessageType;

public record WebSocketMessageResponse(
        WebSocketMessageType type,
        Long qnAId,
        Object payload
) {

    public static WebSocketMessageResponse createTextUpdateResponse(Long qnAId, TextUpdateRequest request){
        return new WebSocketMessageResponse(WebSocketMessageType.TEXT_UPDATE, qnAId, request);
    }
}