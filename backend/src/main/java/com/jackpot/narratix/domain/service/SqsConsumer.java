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

    private final FileProcessFacade fileProcessFacade;

    @SqsListener(value = "${sqs.queue.name}", factory = "sqsMessageListenerContainerFactory")
    public void consume(FileProcessResult message) {
        log.info("SQS Message Received. FileID: {}", message.fileId());

        try {
            if (message.status() == UploadStatus.FAILED) {
                fileProcessFacade.processFailedFile(message.fileId(), message.errorMessage());
                return;
            }

            fileProcessFacade.processUploadedFile(message.fileId(), message.extractedText());

        } catch (Exception e) {
            log.error("Error processing SQS message for fileId: {}", message.fileId(), e);
            throw e;
        }
    }
}