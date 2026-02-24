package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UploadFileRepository extends JpaRepository<UploadFile, String> {

    default UploadFile findByIdOrElseThrow(String fileId) {
        return findById(fileId).orElseThrow(() -> new BaseException(UploadErrorCode.FILE_NOT_FOUND));
    }

    long countByUploadJobIdAndStatus(String uploadJobId, UploadStatus status);

    long countByUploadJobId(String uploadJobId);

    @Query("SELECT DISTINCT f FROM UploadFile f LEFT JOIN FETCH f.labeledQnAs WHERE f.uploadJob.id = :uploadJobId")
    List<UploadFile> findAllWithQnAsByUploadJobId(@Param("uploadJobId") String uploadJobId);
}
