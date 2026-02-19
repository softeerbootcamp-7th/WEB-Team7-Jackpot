package com.jackpot.narratix.domain.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.InvocationType;
import software.amazon.awssdk.services.lambda.model.InvokeRequest;
import software.amazon.awssdk.services.lambda.model.InvokeResponse;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LambdaCallService {
    private final LambdaClient lambdaClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${aws.lambda.function-name}")
    private String functionName;

    public void callLambda(String jobId, List<String> fileIds) {

        for (String fileId : fileIds) {
            invokeSingle(jobId, fileId);
        }
    }

    private void invokeSingle(String jobId, String fileId) {

        try {
            Map<String, Object> payload = Map.of(
                    "jobId", jobId,
                    "fileId", fileId
            );

            String json = objectMapper.writeValueAsString(payload);

            InvokeRequest request = InvokeRequest.builder()
                    .functionName(functionName)
                    .invocationType(InvocationType.EVENT)
                    .payload(SdkBytes.fromString(json, StandardCharsets.UTF_8))
                    .build();

            InvokeResponse response = lambdaClient.invoke(request);

            if (response.statusCode() != 202) {
                log.error("[Lambda Invoke Fail] jobId={}, fileId={}, statusCode={}, functionName={}",
                        jobId, fileId, response.statusCode(), functionName);
            }

            log.info("[Lambda Invoke Success] jobId={}, fileId={}, functionName={}, statusCode={}",
                    jobId, fileId, functionName, response.statusCode());

        } catch (JsonProcessingException e) {
            log.error("[Lambda Payload Serialize Fail] jobId={}, fileId={}", jobId, fileId, e);
        } catch (Exception e) {
            log.error("[Lambda Invoke Error] jobId={}, fileId={}, functionName={}",
                    jobId, fileId, functionName, e);
        }
    }
}
