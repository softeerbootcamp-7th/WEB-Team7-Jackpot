package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UploadFileRepository extends JpaRepository<UploadFile, String> {

    default UploadFile findByIdOrElseThrow(String fileId) {
        return findById(fileId).orElseThrow(() -> new BaseException(UploadErrorCode.FILE_NOT_FOUND)); // 에러 코드는 프로젝트에 맞게 수정해주세요
    }

    @Query("SELECT COUNT(f) FROM UploadFile f WHERE f.uploadJob.id = :jobId AND f.status = 'FAILED'")
    long countFailedFiles(@Param("jobId") String jobId);

    @Query("SELECT COUNT(f) FROM UploadFile f WHERE f.uploadJob.id = :jobId AND f.status = 'COMPLETED'")
    long countCompletedFiles(@Param("jobId") String jobId);
}
