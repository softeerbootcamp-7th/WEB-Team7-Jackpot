package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.LabeledQnA;
import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.entity.UploadJob;
import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import com.jackpot.narratix.domain.repository.UploadFileRepository;
import com.jackpot.narratix.domain.repository.UploadJobRepository;
import com.jackpot.narratix.domain.service.dto.LabeledQnARequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileProcessService {

    private static final int MAX_EXTRACTED_TEXT_LENGTH = 20000;

    private final ObjectMapper objectMapper;
    private final UploadFileRepository uploadFileRepository;
    private final UploadJobRepository uploadJobRepository;
    private final NotificationService notificationService;

    @Lazy
    private final FileProcessService self;

    private static final int MAX_QNA_SIZE = 10;

    @Transactional
    public void processUploadedFile(String fileId, String extractedText, String labelingJson) {
        UploadFile file = uploadFileRepository.findByIdForUpdateOrElseThrow(fileId);

        if (file.isFinalized()) {
            log.info("File {} is already processed. Skipping.", fileId);
            return;
        }

        file.successExtract(limitText(extractedText));
        log.info("Extract success saved. FileId = {}", fileId);

        if (labelingJson == null) {
            file.failLabeling();
            log.warn("AI Labeling Fail saved. FileID: {}", fileId);
            checkJobCompletionAndNotify(file.getUploadJob());
            return;
        }

        List<LabeledQnARequest> qnARequests;

        try {
            qnARequests = objectMapper.readValue(
                    labelingJson,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, LabeledQnARequest.class)
            );
        } catch (JacksonException e) {
            log.error("Failed to parse labeling result. fileId: {}, error: {}", fileId, e.getMessage());
            file.failLabeling();
            checkJobCompletionAndNotify(file.getUploadJob());
            return;
        }

        List<LabeledQnA> labeledQnAs = qnARequests.stream()
                .limit(MAX_QNA_SIZE)
                .map(dto -> LabeledQnA.builder()
                        .uploadFile(file)
                        .question(dto.question())
                        .answer(dto.answer())
                        .questionCategory(dto.questionCategory())
                        .build())
                .toList();
        file.addLabeledQnA(labeledQnAs);
        file.successLabeling();

        log.info("Successfully saved {} labeling items for file: {}", labeledQnAs.size(), fileId);

        checkJobCompletionAndNotify(file.getUploadJob());
    }

    @Transactional
    public void processFailedFile(String fileId, String errorMessage) {
        UploadFile file = uploadFileRepository.findByIdForUpdateOrElseThrow(fileId);

        file.failExtract();
        log.warn("Extract fail saved. FileId={}, error: {}", fileId, errorMessage);

        checkJobCompletionAndNotify(file.getUploadJob());

    }

    private String limitText(String text) {
        if (text == null) return null;
        return (text.length() > MAX_EXTRACTED_TEXT_LENGTH)
                ? text.substring(0, MAX_EXTRACTED_TEXT_LENGTH)
                : text;
    }

    private void checkJobCompletionAndNotify(UploadJob job) {
        executeAfterCommit(() -> self.checkAndNotifyAfterCommit(job.getId()));
    }

    private void executeAfterCommit(Runnable runnable) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                runnable.run();
            }
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkAndNotifyAfterCommit(String jobId) {

        long totalCount = uploadFileRepository.countByUploadJobId(jobId);
        long failCount = uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.FAILED);
        long successCount = uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.COMPLETED);

        if (failCount + successCount == totalCount) {

            int updated = uploadJobRepository.markNotificationSentIfNotYet(jobId);

            if (updated == 1) {
                log.info("All files committed for Job: {}. Sending SSE Notification.", jobId);

                UploadJob job = uploadJobRepository.findByIdOrElseThrow(jobId);

                notificationService.sendLabelingCompleteNotification(
                        job.getUserId(),
                        jobId,
                        successCount,
                        failCount
                );
            }
        }
    }
}

