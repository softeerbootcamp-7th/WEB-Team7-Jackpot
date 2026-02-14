package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "upload_file")
public class UploadFile {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upload_job_id")
    private UploadJob uploadJob;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String s3Key;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UploadStatus status;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String extractedText;


    public void successExtract(String extractedText) {
        this.extractedText = extractedText;
        changeStatus(UploadStatus.EXTRACTED);
    }

    public void failExtract() {
        this.extractedText = null;
        fail();
    }

    @Builder
    public UploadFile(String id, String originalFileName, String s3Key) {
        this.id = id;
        this.originalFileName = originalFileName;
        this.s3Key = s3Key;
        this.status = UploadStatus.PENDING;
    }

    private void changeStatus(UploadStatus status) {
        this.status = status;
    }

    public void fail() {
        this.status = UploadStatus.FAILED;
    }

}
