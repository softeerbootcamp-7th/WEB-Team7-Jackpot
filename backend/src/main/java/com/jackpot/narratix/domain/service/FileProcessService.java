package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.UploadFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileProcessService {

    @Transactional
    public void saveExtractSuccess(UploadFile file, String extractedText) {
        file.successExtract(extractedText);
        log.info("Extract success saved. FileId = {}", file.getId());
    }

    @Transactional
    public void saveExtractFail(UploadFile file, String errorMassage) {
        file.failExtract();
        log.info("Extract fail saved. FileId = {} , error : {}", file.getId(), errorMassage);
    }

    @Transactional
    public void saveLabelingSuccess(UploadFile file, String labelingJson) {
        file.successLabeling(labelingJson);
        log.info("AI Labeling success saved. FileID: {}", file.getId());
    }

    @Transactional
    public void saveLabelingFail(UploadFile file) {
        file.failLabeling();
        log.error("AI Labeling Fail saved. FileID: {}", file.getId());
    }
}
