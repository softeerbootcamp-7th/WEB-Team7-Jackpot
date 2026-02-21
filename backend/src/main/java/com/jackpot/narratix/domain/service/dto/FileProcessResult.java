package com.jackpot.narratix.domain.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jackpot.narratix.domain.entity.enums.UploadStatus;

public record FileProcessResult(
        @JsonProperty("status") UploadStatus status,
        @JsonProperty("fileId") String fileId,
        @JsonProperty("fileName") String fileName,
        @JsonProperty("extractedText") String extractedText,
        @JsonProperty("errorMessage") String errorMessage
) {
}
