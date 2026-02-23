package com.jackpot.narratix.domain.controller.dto;

import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;

public record WebSocketSessionInfo(
        String shareId,
        String userId,
        ReviewRoleType role
) {
}