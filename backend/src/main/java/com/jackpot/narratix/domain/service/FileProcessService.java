package com.jackpot.narratix.domain.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jackpot.narratix.domain.entity.LabeledQnA;
import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.repository.LabeledQnARepository;
import com.jackpot.narratix.domain.repository.UploadFileRepository;
import com.jackpot.narratix.domain.service.dto.LabeledQnARequest;
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
    public void saveExtractSuccess(UploadFile file, String extractedText) {
        file.successExtract(extractedText);
        log.info("Extract success saved. FileId = {}", file.getId());
    }

    @Transactional
    public void saveExtractFail(UploadFile file, String errorMessage) {
        file.failExtract();
        log.warn("Extract fail saved. FileId = {} , error : {}", file.getId(), errorMessage);
    }

    @Transactional
    public void saveLabelingFail(UploadFile file) {
        file.failLabeling();
        log.warn("AI Labeling Fail saved. FileID: {}", file.getId());
    }

    @Transactional
    public void saveLabelingResult(String fileId, String labelingJsonResult) {
        UploadFile uploadFile = uploadFileRepository.findById(fileId)
                .orElseGet(() -> {
                    log.error("File not found for labeling result: {}", fileId);
                    return null;
                });
        try {
            List<LabeledQnARequest> qnAs = objectMapper.readValue(labelingJsonResult,
                    new TypeReference<List<LabeledQnARequest>>() {
                    });

            for (int i = 0; i < qnAs.size(); i++) {
                if (i >= MAX_QNA_SIZE) break;
                LabeledQnARequest dto = qnAs.get(i);
                LabeledQnA qna = LabeledQnA.builder()
                        .uploadFile(uploadFile)
                        .question(dto.question())
                        .answer(dto.answer())
                        .questionCategory(dto.questionCategory())
                        .build();

                labeledQnARepository.save(qna);
            }

            uploadFile.successLabeling();
            log.info("Successfully saved {} labeling items for file: {}", qnAs.size(), fileId);

        } catch (JsonProcessingException e) {
            log.error("Failed to parse labeling result. fileId: {}, error: {}", fileId, e.getMessage());
            uploadFile.failLabeling();
        } catch (Exception e) {
            log.error("Unexpected error during saving labeling result. fileId: {}, error: {}", fileId, e.getMessage());
            uploadFile.failLabeling();
        }
    }

}
