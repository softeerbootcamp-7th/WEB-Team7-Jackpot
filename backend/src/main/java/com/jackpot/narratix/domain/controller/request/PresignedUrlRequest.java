package com.jackpot.narratix.domain.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record PresignedUrlRequest(

        @NotEmpty(message = "업로드할 파일 정보가 필요합니다.")
        List<FileRequest> files
) {
    public record FileRequest(
            @NotBlank(message = "파일명은 필수입니다.")
            String fileName,

            @NotBlank(message = "파일 타입은 필수입니다.")
            String contentType,

            @Positive(message = "파일 크기는 0보다 커야 합니다.")
            long fileSize
    ) {
    }

}