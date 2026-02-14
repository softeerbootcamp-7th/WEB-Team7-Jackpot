package com.jackpot.narratix.domain.controller.response;

import java.time.LocalDateTime;

public record ReviewEditResponse(
        LocalDateTime modifiedAt
) {
}
