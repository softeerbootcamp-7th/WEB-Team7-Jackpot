package com.jackpot.narratix.domain.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum WebSocketMessageType {
    REVIEW_CREATED,
    REVIEW_UPDATED,
    REVIEW_DELETED,
    TEXT_UPDATE
}