package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.entity.enums.UploadJobStatusType;
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
    private UploadJobStatusType status;

    @Builder
    public UploadFile(String id, String originalFileName, String s3Key) {
        this.id = id;
        this.originalFileName = originalFileName;
        this.s3Key = s3Key;
        this.status = UploadJobStatusType.PENDING;
    }

    public void changeStatus(UploadJobStatusType status) {
        this.status = status;
    }

    public void fail() {
        this.status = UploadJobStatusType.FAILED;
    }

}
