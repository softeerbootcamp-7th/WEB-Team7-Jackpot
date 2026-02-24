package com.jackpot.narratix.domain.controller.request;

import jakarta.validation.constraints.NotNull;

public record ShareLinkActiveRequest(
        @NotNull(message = "active는 필수 입력 항목입니다.") Boolean active
) {
}
