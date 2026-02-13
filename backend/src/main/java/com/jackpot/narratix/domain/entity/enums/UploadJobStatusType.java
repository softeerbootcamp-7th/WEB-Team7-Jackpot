package com.jackpot.narratix.domain.entity.enums;

public enum UploadStatusType {
    PENDING,        // 1. Presigned URL 발급 완료 (업로드 대기)
    UPLOADED,       // 2. S3 업로드 감지됨 (Lambda -> DB 업데이트)
    PROCESSING,     // 3. AI 분석 진행 중
    COMPLETED,      // 4. 분석 완료
    FAILED          // 5. 실패
}
