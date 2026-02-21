package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UploadFileRepository extends JpaRepository<UploadFile, String> {

    default UploadFile findByIdOrElseThrow(String fileId) {
        return findById(fileId).orElseThrow(() -> new BaseException(UploadErrorCode.FILE_NOT_FOUND));
    }

    long countByUploadJobIdAndStatus(String uploadJobId, UploadStatus status);

    long countByUploadJobId(String uploadJobId);
}
