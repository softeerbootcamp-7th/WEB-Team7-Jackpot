package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UploadFileRepository extends JpaRepository<UploadFile, String> {

    default UploadFile findByIdOrElseThrow(String fileId) {
        return findById(fileId).orElseThrow(() -> new BaseException(UploadErrorCode.FILE_NOT_FOUND));
    }

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM UploadFile f WHERE f.id = :id")
    Optional<UploadFile> findLockedById(@Param("id") String id);

    default UploadFile findByIdForUpdateOrElseThrow(String fileId) {
        return findLockedById(fileId)
                .orElseThrow(() -> new BaseException(UploadErrorCode.FILE_NOT_FOUND));
    }

    long countByUploadJobIdAndStatus(String uploadJobId, UploadStatus status);

    long countByUploadJobId(String uploadJobId);

    @Query("SELECT DISTINCT f FROM UploadFile f LEFT JOIN FETCH f.labeledQnAs WHERE f.uploadJob.id = :uploadJobId")
    List<UploadFile> findAllWithQnAsByUploadJobId(@Param("uploadJobId") String uploadJobId);
}
