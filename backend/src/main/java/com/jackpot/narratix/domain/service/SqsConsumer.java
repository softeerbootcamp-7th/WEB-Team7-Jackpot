package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import com.jackpot.narratix.domain.service.dto.FileProcessResult;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Profile("prod")
@Slf4j
@Component
@RequiredArgsConstructor
public class SqsConsumer {

    private final AiLabelingService aiLabelingService;
    private final FileProcessService fileProcessService;

    @SqsListener(value = "${sqs.queue.name}", factory = "sqsMessageListenerContainerFactory")
    public void consume(FileProcessResult message) {
        log.info("SQS Message Received. FileID: {}", message.fileId());

        try {
            if (message.status() == UploadStatus.FAILED) {
                fileProcessService.processFailedFile(message.fileId(), message.errorMessage());
                return;
            }

            String labelingJson = aiLabelingService.generateLabelingJson(message.extractedText());

            fileProcessService.processUploadedFile(message.fileId(), message.extractedText(), labelingJson);
        } catch (Exception e) {
            log.error("Error processing SQS message for fileId: {}", message.fileId(), e);
            throw e;
        }
    }

    @SqsListener(value = "${sqs.queue.dlqname}", factory = "sqsMessageListenerContainerFactory")
    public void consumeDlq(FileProcessResult message) {
        log.error("Final Fail from DLQ for fileId: {}", message.fileId());

        fileProcessService.processFailedFile(message.fileId(), "최종 재시도 횟수 초과 (DLQ에서 받음)");
    }

}