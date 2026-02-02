package com.jackpot.narratix.domain.controller.request;

import com.jackpot.narratix.domain.entity.enums.LibraryType;
import jakarta.validation.constraints.NotNull;

public record GetLibraryListRequest(
        @NotNull(message = "라이브러리 타입은 필수 항목입니다.") LibraryType type
) {
}
