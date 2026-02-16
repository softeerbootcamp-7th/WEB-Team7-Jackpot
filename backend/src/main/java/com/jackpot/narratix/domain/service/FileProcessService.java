package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.repository.UploadFileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileProcessService {

    private final UploadFileRepository uploadFileRepository;
    private final AILabelingService aiLabelingService;

    @Transactional
    public void processUploadedFile(String fileId, String extractedText) {
        uploadFileRepository.findById(fileId).ifPresentOrElse(
                file -> {
                    file.successExtract(extractedText);
                    log.info("File processing completed. FileID: {}", fileId);

                    String jsonResult = aiLabelingService.analyzeAndLabel(extractedText);
                    log.info("AI Labeling Completed: {}", jsonResult);
                },
                () -> log.error("Error: File not found for ID: {}. Skipping process.", fileId)
        );
    }

    @Transactional
    public void processFailedFile(String fileId, String errorMessage) {
        uploadFileRepository.findById(fileId).ifPresentOrElse(
                file -> {
                    file.failExtract();
                    log.info("File processing failed. FileID: {}, Reason: {}", fileId, errorMessage);
                },
                () -> log.error("Error: File not found for ID: {}. Skipping process.", fileId)
        );
    }
}
