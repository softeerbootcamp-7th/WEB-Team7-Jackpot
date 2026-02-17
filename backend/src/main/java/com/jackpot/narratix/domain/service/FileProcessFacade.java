package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.repository.UploadFileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileProcessFacade {

    private final UploadFileRepository uploadFileRepository;
    private final AiLabelingService aiLabelingService;
    private final FileProcessService fileProcessService;

    public void processUploadedFile(String fileId, String extractedText) {

        UploadFile file = uploadFileRepository.findById(fileId).orElse(null);
        if (file == null) {
            log.warn("File not found. skip. fileId={}", fileId);
            return;
        }

        fileProcessService.saveExtractSuccess(fileId, extractedText);

        try {
            String labelingJsonResult = aiLabelingService.aiAnalyze(extractedText);
            fileProcessService.saveLabelingSuccess(fileId, labelingJsonResult);
        } catch (Exception e) {
            fileProcessService.saveLabelingFail(fileId);
        }
    }

    public void processFailedFile(String fileId, String errorMessage) {
        fileProcessService.saveExtractFail(fileId, errorMessage);
    }
}
