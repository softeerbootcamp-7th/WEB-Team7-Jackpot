package com.jackpot.narratix.domain.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AiLabelingRequest(
        @JsonProperty("system_instruction")
        SystemInstruction systemInstruction,
        List<Content> contents,
        GenerationConfig generationConfig
) {

    public record SystemInstruction(List<Part> parts) {
    }

    public record Content(List<Part> parts) {
    }

    public record Part(String text) {
    }

    public record GenerationConfig(
            @JsonProperty("response_mime_type")
            String responseMimeType
    ) {
    }

    public static AiLabelingRequest of(String systemPrompt, String text) {
        return new AiLabelingRequest(
                new SystemInstruction(List.of(new Part(systemPrompt))),
                List.of(new Content(List.of(new Part(text)))),
                new GenerationConfig("application/json")
        );
    }
}