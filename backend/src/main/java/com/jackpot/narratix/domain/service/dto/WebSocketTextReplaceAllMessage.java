package com.jackpot.narratix.domain.service.dto;

import com.jackpot.narratix.domain.event.TextReplaceAllEvent;

public record WebSocketTextReplaceAllMessage(
        Long version,
        String content
) {
    public static WebSocketTextReplaceAllMessage of(TextReplaceAllEvent event) {
        return new WebSocketTextReplaceAllMessage(event.version(), event.content());
    }
}
