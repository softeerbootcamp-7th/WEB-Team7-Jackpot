package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.UploadJob;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UploadJobRepository extends JpaRepository<UploadJob, String> {

    default UploadJob findByIdOrElseThrow(String uploadJobId) {
        return findById(uploadJobId).orElseThrow(() -> new BaseException(UploadErrorCode.UPLOAD_JOB_NOT_FOUND));
    }

    @Modifying
    @Query("""
                UPDATE UploadJob j
                SET j.notificationSent = true
                WHERE j.id = :jobId
                  AND j.notificationSent = false
            """)
    int markNotificationSentIfNotYet(@Param("jobId") String uploadJobId);
}
