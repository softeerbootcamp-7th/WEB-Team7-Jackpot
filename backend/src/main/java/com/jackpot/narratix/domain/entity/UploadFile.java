package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.ArrayList;
import java.util.List;

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
    @OnDelete(action = OnDeleteAction.CASCADE)
    private UploadJob uploadJob;

    @OneToMany(mappedBy = "uploadFile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LabeledQnA> labeledQnAs = new ArrayList<>();

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
        changeStatus(UploadStatus.FAILED);
    }

    public void successLabeling() {
        changeStatus(UploadStatus.COMPLETED);
    }

    public void failLabeling() {
        changeStatus(UploadStatus.FAILED);
    }

    @Builder
    public UploadFile(String id, String s3Key) {
        this.id = id;
        this.s3Key = s3Key;
        this.status = UploadStatus.PENDING;
        this.labeledQnAs = new ArrayList<>();
    }

    protected void assignToJob(UploadJob uploadJob) {
        this.uploadJob = uploadJob;
    }

    private void changeStatus(UploadStatus status) {
        this.status = status;
    }

    public void addLabeledQnA(List<LabeledQnA> labeledQnAs) {
        labeledQnAs.forEach(labeledQnA -> {
            this.labeledQnAs.add(labeledQnA);
            labeledQnA.connectUploadFile(this);
        });
    }

    public boolean isFinalized() {
        return this.status == UploadStatus.COMPLETED || this.status == UploadStatus.FAILED;
    }
}
