package com.jackpot.narratix.domain.controller.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PresignedUrlRequest(

        @NotNull(message = "파일 아이디는 필수입니다.")
        Long clientFileId,

        @NotBlank(message = "파일명은 필수입니다.")
        String fileName,

        @NotBlank(message = "파일 타입은 필수입니다.")
        String contentType,

        @Positive(message = "파일 크기는 0보다 커야 합니다.")
        long fileSize
) {
}