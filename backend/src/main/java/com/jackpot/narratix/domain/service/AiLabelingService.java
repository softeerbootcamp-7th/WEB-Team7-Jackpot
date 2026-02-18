package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.exception.AiLabelingException;
import com.jackpot.narratix.domain.service.dto.AiLabelingRequest;
import com.jackpot.narratix.domain.service.dto.AiLabelingResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.client.RestClient;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class AiLabelingService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String promptTemplate;
    private final String apiKey;
    private final String modelPath;

    public AiLabelingService(
            RestClient geminiRestClient,
            @Value("${gemini.api-key}") String apiKey,
            @Value("${gemini.model-path}") String modelPath,
            @Value("classpath:LabelingPrompt.txt") Resource promptResource
    ) {
        this.restClient = geminiRestClient;
        this.apiKey = apiKey;
        this.modelPath = modelPath;
        this.promptTemplate = loadPrompt(promptResource);
    }

    public String generateLabelingJson(String extractedText) {
        validateInput(extractedText);

        String fullPrompt = buildPrompt(extractedText);
        AiLabelingRequest requestBody = AiLabelingRequest.of(fullPrompt);

        AiLabelingResponse response = requestLabeling(requestBody);

        String rawText = extractResponseText(response);
        String normalizedJson = normalizeToJson(rawText);

        validateJsonArray(normalizedJson);

        log.info("AI labeling completed. responseLength={}", normalizedJson.length());
        return normalizedJson;
    }

    private String loadPrompt(Resource resource) {
        try (InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
            return FileCopyUtils.copyToString(reader);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load AI labeling prompt template.", e);
        }
    }

    private void validateInput(String extractedText) {
        if (extractedText == null || extractedText.isBlank()) {
            throw new AiLabelingException("AI labeling input text is blank.");
        }
    }

    private String buildPrompt(String extractedText) {
        return promptTemplate.replace("{{INPUT_TEXT}}", extractedText);
    }

    private AiLabelingResponse requestLabeling(AiLabelingRequest requestBody) {
        try {
            return restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path(modelPath)
                            .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-goog-api-key", apiKey)
                    .body(requestBody)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        throw new AiLabelingException("AI labeling request failed (4xx). status=" + res.getStatusCode());
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        throw new AiLabelingException("AI labeling request failed (5xx). status=" + res.getStatusCode());
                    })
                    .body(AiLabelingResponse.class);

        } catch (AiLabelingException e) {
            throw e;
        } catch (Exception e) {
            log.error("AI labeling request failed due to unexpected error.", e);
            throw new AiLabelingException("AI labeling request failed due to unexpected error.", e);
        }
    }

    private String extractResponseText(AiLabelingResponse response) {
        String rawText = response.extractText();

        if (rawText == null || rawText.isBlank()) {
            throw new AiLabelingException("AI labeling response is null or blank.");
        }

        return rawText.trim();
    }

    private String normalizeToJson(String rawText) {
        String text = rawText.trim();

        if (text.startsWith("```")) {
            text = text.replaceAll("^```[a-zA-Z]*\\s*", "");
            text = text.replaceAll("\\s*```$", "");
            text = text.trim();
        }

        int start = text.indexOf('[');
        int end = text.lastIndexOf(']');

        if (start == -1 || end == -1 || start >= end) {
            throw new AiLabelingException("AI labeling response does not contain a valid JSON array.");
        }

        return text.substring(start, end + 1).trim();
    }

    private void validateJsonArray(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);

            if (!root.isArray()) {
                throw new AiLabelingException("AI labeling response is not a JSON array.");
            }
        } catch (JacksonException e) {
            log.warn("Invalid JSON received. length={}", json.length());
            throw new AiLabelingException("AI labeling response is not a valid JSON.", e);
        }
    }
}
