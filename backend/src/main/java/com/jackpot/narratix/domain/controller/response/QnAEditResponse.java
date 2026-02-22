package com.jackpot.narratix.domain.controller.response;

import java.time.LocalDateTime;

public record QnAEditResponse(
        Long qnaId,
        LocalDateTime modifiedAt
) {
}
