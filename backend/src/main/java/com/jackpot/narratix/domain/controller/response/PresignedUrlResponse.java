package com.jackpot.narratix.domain.controller.response;

import java.util.Map;

public record PresignedUrlResponse(
        Long fileId,
        String fileName,
        String presignedUrl,
        String fileKey,
        Map<String, String> requiredHeaders
) {
}
