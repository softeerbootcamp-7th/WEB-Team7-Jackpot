package com.jackpot.narratix.domain.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jackpot.narratix.domain.entity.LabeledQnA;
import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.domain.repository.LabeledQnARepository;
import com.jackpot.narratix.domain.repository.UploadFileRepository;
import com.jackpot.narratix.domain.service.dto.LabeledQnARequest;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileProcessService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final UploadFileRepository uploadFileRepository;
    private final LabeledQnARepository labeledQnARepository;

    private static final int MAX_QNA_SIZE = 10;

    @Transactional
    public void processUploadedFile(String fileId, String extractedText, String labelingJson) {
        UploadFile file = uploadFileRepository.findById(fileId)
                .orElseThrow(() -> {
                    log.error("File not found. skip. fileId={}", fileId);
                    return new BaseException(UploadErrorCode.FILE_NOT_FOUND);
                });

        file.successExtract(extractedText);
        log.info("Extract success saved. FileId = {}", fileId);

        if (labelingJson == null) {
            file.failLabeling();
            log.warn("AI Labeling Fail saved. FileID: {}", fileId);
            return;
        }

        List<LabeledQnARequest> qnARequests = List.of();

        try {
            qnARequests = objectMapper.readValue(labelingJson, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            log.error("Failed to parse labeling result. fileId: {}, error: {}", fileId, e.getMessage());
            file.failLabeling();
            return;
        }

        List<LabeledQnA> qnAs = qnARequests.stream()
                .limit(MAX_QNA_SIZE)
                .map(dto -> LabeledQnA.builder()
                        .uploadFile(file)
                        .question(dto.question())
                        .answer(dto.answer())
                        .questionCategory(dto.questionCategory())
                        .build())
                .toList();
        labeledQnARepository.saveAll(qnAs);

        file.successLabeling();

        log.info("Successfully saved {} labeling items for file: {}", qnAs.size(), fileId);
    }

    @Transactional
    public void processFailedFile(String fileId, String errorMessage) {
        UploadFile file = uploadFileRepository.findById(fileId).orElse(null);
        if (file == null) {
            log.warn("File not found. skip. fileId={}", fileId);
            return;
        }
        file.failExtract();
        log.warn("Extract fail saved. FileId={}, error: {}", fileId, errorMessage);
    }
}