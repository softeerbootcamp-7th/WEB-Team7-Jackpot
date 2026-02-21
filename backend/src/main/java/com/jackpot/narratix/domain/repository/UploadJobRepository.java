package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.UploadJob;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UploadJobRepository extends JpaRepository<UploadJob, String> {

    default UploadJob findByIdOrElseThrow(String uploadJobId){
        return findById(uploadJobId).orElseThrow(() -> new BaseException(UploadErrorCode.UPLOAD_JOB_NOT_FOUND));
    }
}
