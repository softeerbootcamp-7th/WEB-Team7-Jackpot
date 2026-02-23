package com.jackpot.narratix.domain.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.jackpot.narratix.domain.entity.LabeledQnA;
import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.entity.UploadJob;
import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import com.jackpot.narratix.domain.repository.UploadFileRepository;
import com.jackpot.narratix.domain.service.dto.LabeledQnARequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileProcessService {

    private final ObjectMapper objectMapper;
    private final UploadFileRepository uploadFileRepository;
    private final NotificationService notificationService;

    private static final int MAX_QNA_SIZE = 10;

    @Transactional
    public void processUploadedFile(String fileId, String extractedText, String labelingJson) {
        UploadFile file = uploadFileRepository.findByIdOrElseThrow(fileId);

        file.successExtract(extractedText);
        log.info("Extract success saved. FileId = {}", fileId);

        if (labelingJson == null) {
            file.failLabeling();
            log.warn("AI Labeling Fail saved. FileID: {}", fileId);
            checkJobCompletionAndNotify(file.getUploadJob());
            return;
        }

        List<LabeledQnARequest> qnARequests;

        try {
            qnARequests = objectMapper.readValue(labelingJson, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
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
        UploadFile file = uploadFileRepository.findByIdOrElseThrow(fileId);

        file.failExtract();
        log.warn("Extract fail saved. FileId={}, error: {}", fileId, errorMessage);

        checkJobCompletionAndNotify(file.getUploadJob());

    }

    private void checkJobCompletionAndNotify(UploadJob job) {

        uploadFileRepository.flush();
        long totalCount = uploadFileRepository.countByUploadJobId(job.getId());
        long failCount = uploadFileRepository.countByUploadJobIdAndStatus(job.getId(), UploadStatus.FAILED);
        long successCount = uploadFileRepository.countByUploadJobIdAndStatus(job.getId(), UploadStatus.COMPLETED);

        if (failCount + successCount == totalCount) {
            log.info("All files completed for Job: {}. Sending SSE Notification.", job.getId());

            notificationService.sendLabelingCompleteNotification(job.getUserId(), job.getId(), successCount, failCount);
        }
    }
}

