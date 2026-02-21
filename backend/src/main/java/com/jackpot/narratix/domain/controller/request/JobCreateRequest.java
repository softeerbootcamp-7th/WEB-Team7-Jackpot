package com.jackpot.narratix.domain.controller.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record JobCreateRequest(
        @NotEmpty(message = "최소 하나 이상의 파일 정보가 필요합니다.")
        @Valid @Size(max = 3, message = "한 번에 최대 3개의 파일만 업로드할 수 있습니다.") List<FileRequest> files
) {

    public record FileRequest(
            @NotBlank String presignedUrl,
            @NotBlank String fileKey
    ) {
    }
}
