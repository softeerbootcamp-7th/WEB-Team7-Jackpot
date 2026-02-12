package com.jackpot.narratix.domain.controller.response;

import java.util.List;
import java.util.Map;

public record PresignedUrlResponse(
        List<PresignedUrlInfo> presignedUrls
) {
    public record PresignedUrlInfo(
            String fileName,      // 클라이언트가 보낸 원본 파일명 (매칭용)
            String presignedUrl,
            String fileKey,
            Map<String, String> requiredHeaders
    ) {
    }
}
