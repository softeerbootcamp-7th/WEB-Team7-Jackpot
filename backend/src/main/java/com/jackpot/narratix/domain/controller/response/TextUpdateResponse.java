package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;

public record TextUpdateResponse(
        long version,
        int startIdx,
        int endIdx,
        String replacedText
) {
    public static TextUpdateResponse of(long deltaVersion, TextUpdateRequest request) {
        return new TextUpdateResponse(deltaVersion, request.startIdx(), request.endIdx(), request.replacedText());
    }
}
