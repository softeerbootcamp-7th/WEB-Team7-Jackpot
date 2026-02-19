package com.jackpot.narratix.domain.controller.response;

import java.util.Map;

public record PresignedUrlResponse(
        Long clientFileId,
        String fileName,
        String presignedUrl,
        String fileKey,
        Map<String, String> requiredHeaders
) {
}
