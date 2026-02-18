package com.jackpot.narratix.domain.service.dto;

import java.util.List;

public record AiLabelingRequest(
        List<Content> contents,
        GenerationConfig generationConfig
) {
    public record Content(
            List<Part> parts) {
    }

    public record Part(
            String text) {
    }

    public record GenerationConfig(
            String responseMimeType
    ) {
    }

    public static AiLabelingRequest of(String text) {
        return new AiLabelingRequest(
                List.of(new Content(List.of(new Part(text)))),
                new GenerationConfig("application/json")
        );
    }
}