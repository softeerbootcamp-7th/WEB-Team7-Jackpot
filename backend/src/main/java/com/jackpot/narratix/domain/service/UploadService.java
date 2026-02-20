package com.jackpot.narratix.domain.service;

import com.github.f4b6a3.ulid.UlidCreator;
import com.jackpot.narratix.domain.controller.request.JobCreateRequest;
import com.jackpot.narratix.domain.controller.request.PresignedUrlRequest;
import com.jackpot.narratix.domain.controller.response.LabeledQnAListResponse;
import com.jackpot.narratix.domain.controller.response.PresignedUrlResponse;
import com.jackpot.narratix.domain.entity.LabeledQnA;
import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.entity.UploadJob;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.domain.repository.LabeledQnARepository;
import com.jackpot.narratix.domain.repository.UploadJobRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.List;
import java.util.Map;


@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private final S3Presigner s3Presigner;

    private final UploadJobRepository uploadJobRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final LambdaCallService lambdaCallService;

    private final LabeledQnARepository labeledQnARepository;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    private static final Duration PRESIGNED_URL_EXPIRE = Duration.ofMinutes(10);   // 10분
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;                    // 5MB
    private static final String FOLDER_NAME = "coverletter";

    public PresignedUrlResponse createPresignedUrl(String userId, PresignedUrlRequest request) {

        validateFile(request);

        String fileId = UlidCreator.getUlid().toString();
        String s3Key = generateS3Key(userId, fileId);

        try {
            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(PRESIGNED_URL_EXPIRE)
                    .putObjectRequest(p -> p
                            .bucket(bucket)
                            .key(s3Key)
                            .contentType(request.contentType()))
                    .build();

            PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(presignRequest);

            return new PresignedUrlResponse(
                    request.clientFileId(),
                    request.fileName(),
                    presigned.url().toString(),
                    s3Key,
                    Map.of(HttpHeaders.CONTENT_TYPE, request.contentType())
            );
        } catch (SdkException e) {
            log.error("AWS S3 Error occurred while generating URL. key: {}, Error: {}", s3Key, e.getMessage());
            throw new BaseException(UploadErrorCode.PRESIGNED_URL_GENERATION_FAILED);
        }
    }

    private void validateFile(PresignedUrlRequest request) {
        if (!"application/pdf".equalsIgnoreCase(request.contentType())) {
            throw new BaseException(UploadErrorCode.INVALID_CONTENT_TYPE_FOR_PDF);
        }

        String fileName = request.fileName().toLowerCase();
        if (!fileName.endsWith(".pdf")) {
            throw new BaseException(UploadErrorCode.INVALID_CONTENT_TYPE_FOR_PDF);
        }
        if (request.fileSize() > MAX_FILE_SIZE) {
            throw new BaseException(UploadErrorCode.FILE_SIZE_EXCEEDED);
        }
    }

    private String generateS3Key(String userId, String fileId) {
        return "%s/%s/%s.pdf".formatted(FOLDER_NAME, userId, fileId);
    }

    @Transactional
    public void createJob(String userId, JobCreateRequest request) {

        String jobId = UlidCreator.getUlid().toString();
        UploadJob job = UploadJob.builder()
                .id(jobId)
                .userId(userId)
                .build();

        for (JobCreateRequest.FileRequest fileRequest : request.files()) {
            String fileId = extractFileId(fileRequest.fileKey());
            String s3Key = fileRequest.fileKey();
            UploadFile uploadFile = UploadFile.builder()
                    .id(fileId)
                    .s3Key(s3Key)
                    .build();
            job.addFile(uploadFile);
            lambdaCallService.callLambda(fileId, s3Key);
        }
        uploadJobRepository.save(job);
    }

    private String extractFileId(String fileKey) {
        int lastSlashIndex = fileKey.lastIndexOf("/");
        String fileName = (lastSlashIndex != -1 && lastSlashIndex < fileKey.length() - 1)
                ? fileKey.substring(lastSlashIndex + 1)
                : fileKey;
        if (fileName.toLowerCase().endsWith(".pdf")) {
            return fileName.substring(0, fileName.length() - 4);
        }
        throw new BaseException(UploadErrorCode.INVALID_FILE_KEY);
    }

    @Transactional(readOnly = true)
    public LabeledQnAListResponse findLabeledCoverLetterByUploadJobId(String userId, String uploadJobId) {
        UploadJob uploadJob = uploadJobRepository.findByIdOrElseThrow(uploadJobId);

        if (!uploadJob.isOwner(userId)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }

        List<LabeledQnA> labeledQnAs = labeledQnARepository.findAllByUploadJobId(uploadJobId);

        return LabeledQnAListResponse.of(labeledQnAs);
    }
}
