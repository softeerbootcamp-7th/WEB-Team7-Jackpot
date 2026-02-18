package com.jackpot.narratix.domain.service.dto;

import com.jackpot.narratix.domain.exception.AiLabelingException;

import java.util.List;

public record AiLabelingResponse(List<Candidate> candidates) {

    public record Candidate(Content content) {
    }

    public record Content(List<Part> parts) {
    }

    public record Part(String text) {
    }

    public String extractText() {
        if (candidates == null || candidates.isEmpty()
                || candidates.get(0).content() == null
                || candidates.get(0).content().parts() == null
                || candidates.get(0).content().parts().isEmpty()) {
            throw new AiLabelingException("Gemini API 응답이 비어있거나 유효하지 않습니다.");
        }
        return candidates.get(0).content().parts().get(0).text();
    }
}