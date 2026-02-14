package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.FileProcessResult;
import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SqsConsumer {

    private final FileProcessService fileProcessService;
    private final ThreadPoolTaskExecutor aiLabellingTaskExecutor;


    @SqsListener(value = "${sqs.queue.name}", factory = "sqsMessageListenerContainerFactory")
    public void consume(FileProcessResult message) {
        log.info("SQS Message Received. FileID: {}, Status: {}", message.fileId(), message.status());

        try {
            if (message.status() == UploadStatus.FAILED) {
                fileProcessService.processFailedFile(message.fileId(), message.errorMessage());
                return;
            }

            aiLabellingTaskExecutor.execute(() ->
                    fileProcessService.processUploadedFile(message.fileId(), message.extractedText()));

        } catch (Exception e) {
            log.error("Error processing SQS message for fileId: {}", message.fileId(), e);
            throw e;
        }
    }
}