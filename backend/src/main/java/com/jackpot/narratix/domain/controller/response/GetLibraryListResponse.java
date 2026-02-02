package com.jackpot.narratix.domain.controller.response;

import java.util.List;

public record GetLibraryListResponse(
        List<String> libraries
) {
}
