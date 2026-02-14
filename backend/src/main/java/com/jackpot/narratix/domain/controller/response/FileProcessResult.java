package com.jackpot.narratix.domain.controller.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import jakarta.persistence.Column;

public record FileProcessResult(
        @JsonProperty("status") UploadStatus status,
        @JsonProperty("fileId") String fileId,
        @JsonProperty("fileName") String fileName,
        @Column(columnDefinition = "TEXT") @JsonProperty("extractedText") String extractedText,
        @JsonProperty("errorMessage") String errorMessage
) {
}
