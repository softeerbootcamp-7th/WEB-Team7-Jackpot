package com.jackpot.narratix.domain.service;

import com.github.f4b6a3.ulid.UlidCreator;
import com.jackpot.narratix.domain.controller.request.PresignedUrlRequest;
import com.jackpot.narratix.domain.controller.response.PresignedUrlResponse;
import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.entity.UploadJob;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.domain.repository.UploadJobRepository;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private final S3Presigner s3Presigner;

    private final UploadJobRepository uploadJobRepository;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    private static final Duration PRESIGNED_URL_EXPIRE = Duration.ofMinutes(10);   // 10분
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;                    // 10MB
    private static final int MAX_FILE_COUNT = 3;
    private static final String FOLDER_NAME = "coverletter";

    public PresignedUrlResponse createAllPresignedUrl(String userId, PresignedUrlRequest request) {
        validateFileCount(request.files());

        String jobId = UlidCreator.getUlid().toString();
        UploadJob job = UploadJob.builder()
                .id(jobId)
                .userId(userId)
                .build();

        List<PresignedUrlResponse.PresignedUrlInfo> responses = new ArrayList<>();

        for (PresignedUrlRequest.FileRequest fileRequest : request.files()) {
            validateFile(fileRequest);

            String fileId = UlidCreator.getUlid().toString();
            String s3Key = generateS3Key(userId, fileId);

            UploadFile file = UploadFile.builder()
                    .id(fileId)
                    .originalFileName(fileRequest.fileName())
                    .s3Key(s3Key)
                    .build();

            job.addFile(file);

            responses.add(createSinglePresignedUrl(s3Key, fileId, fileRequest));
        }
        uploadJobRepository.save(job);

        return new PresignedUrlResponse(responses);
    }

    private void validateFileCount(List<PresignedUrlRequest.FileRequest> files) {
        if (files == null || files.isEmpty()) {
            throw new BaseException(UploadErrorCode.EMPTY_FILE_LIST);
        }
        if (files.size() > MAX_FILE_COUNT) {
            throw new BaseException(UploadErrorCode.TOO_MANY_FILES);
        }
    }

    private PresignedUrlResponse.PresignedUrlInfo createSinglePresignedUrl(String s3Key, String fileId, PresignedUrlRequest.FileRequest request) {
        validateFile(request);

        Map<String, String> metadata = Map.of(
                "fileid", fileId
        );

        try {
            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(PRESIGNED_URL_EXPIRE)
                    .putObjectRequest(p -> p
                            .bucket(bucket)
                            .key(s3Key)
                            .contentType(request.contentType())
                            .metadata(metadata))
                    .build();

            PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(presignRequest);

            return new PresignedUrlResponse.PresignedUrlInfo(
                    request.fileName(),
                    presigned.url().toString(),
                    s3Key,
                    Map.of(
                            "Content-Type", request.contentType(),
                            "x-amz-meta-fileid", fileId)
            );
        } catch (SdkException e) {
            log.error("AWS S3 Error occurred while generating URL. key: {}, Error: {}", s3Key, e.getMessage());
            throw new BaseException(UploadErrorCode.PRESIGNED_URL_GENERATION_FAILED);
        }
    }

    private void validateFile(PresignedUrlRequest.FileRequest request) {
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
}
