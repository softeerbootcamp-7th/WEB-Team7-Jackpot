package com.jackpot.narratix.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "upload_job", indexes = {
        @Index(name = "idx_upload_job_user_id", columnList = "user_id")
})
public class UploadJob extends BaseTimeEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String userId;

    @OneToMany(mappedBy = "uploadJob", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UploadFile> files = new ArrayList<>();


    @Builder
    public UploadJob(String id, String userId) {
        this.id = id;
        this.userId = userId;
    }

    public void addFile(UploadFile file) {
        this.files.add(file);
        file.assignToJob(this);
    }

}
