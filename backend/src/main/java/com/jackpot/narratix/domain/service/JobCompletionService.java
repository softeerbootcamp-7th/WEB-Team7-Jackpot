package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.UploadJob;
import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import com.jackpot.narratix.domain.repository.UploadFileRepository;
import com.jackpot.narratix.domain.repository.UploadJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobCompletionService {

    private final UploadFileRepository uploadFileRepository;
    private final UploadJobRepository uploadJobRepository;
    private final NotificationService notificationService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void checkAndNotify(String jobId) {

        long totalCount = uploadFileRepository.countByUploadJobId(jobId);
        long failCount = uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.FAILED);
        long successCount = uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.COMPLETED);

        if (failCount + successCount == totalCount) {

            int updated = uploadJobRepository.markNotificationSentIfNotYet(jobId);

            if (updated == 1) {
                log.info("All files committed for Job: {}. Sending SSE Notification.", jobId);

                UploadJob job = uploadJobRepository.findByIdOrElseThrow(jobId);

                notificationService.sendLabelingCompleteNotification(
                        job.getUserId(),
                        jobId,
                        successCount,
                        failCount
                );
            }
        }
    }
}