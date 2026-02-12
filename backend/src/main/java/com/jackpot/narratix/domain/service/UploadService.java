package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.PresignedUrlRequest;
import com.jackpot.narratix.domain.controller.response.PresignedUrlResponse;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
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
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private final S3Presigner s3Presigner;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    private static final Duration PRESIGNED_URL_EXPIRE = Duration.ofMinutes(10);   // 10분
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;                    // 10MB

    public PresignedUrlResponse createPresignedUrl(String userId, PresignedUrlRequest request) {
        validateFile(request);

        String s3Key = generateS3Key(userId);

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
                    presigned.url().toString(),
                    s3Key,
                    Map.of("Content-Type", request.contentType())
            );
        } catch (SdkException e) {
            log.error("AWS S3 Error occurred while generating URL. User: {}, Error: {}", userId, e.getMessage());
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

    private String generateS3Key(String userId) {
        String uuid = UUID.randomUUID().toString();
        return "users/%s/%s.pdf".formatted(userId, uuid);
    }
}
