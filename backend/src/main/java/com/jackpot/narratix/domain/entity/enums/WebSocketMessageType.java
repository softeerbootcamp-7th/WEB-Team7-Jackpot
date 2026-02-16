package com.jackpot.narratix.domain.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum WebSocketMessageType {
    COMMENT_CREATED,
    COMMENT_UPDATED, TEXT_UPDATE
}