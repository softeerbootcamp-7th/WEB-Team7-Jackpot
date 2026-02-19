package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.controller.request.CoverLetterAndQnAEditRequest;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "coverletter")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class CoverLetter extends BaseTimeEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private String userId;

    @NotNull
    @Column(name = "company_name", nullable = false)
    private String companyName;

    @NotNull
    @Column(name = "apply_year", nullable = false)
    private Integer applyYear;

    @NotNull
    @Column(name = "apply_half", nullable = false)
    @Enumerated(EnumType.STRING)
    private ApplyHalfType applyHalf;

    @NotNull
    @Column(name = "job_position", nullable = false)
    private String jobPosition;

    @NotNull
    @Column(name = "deadline", nullable = false)
    private LocalDate deadline;

    @Builder.Default
    @OneToMany(mappedBy = "coverLetter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QnA> qnAs = new ArrayList<>();

    public void addQnAs(List<QnA> qnAs) {
        qnAs.forEach(qnA -> {
            this.qnAs.add(qnA);
            qnA.connectCoverLetter(this);
        });
    }

    public int getQuestionCount() {
        return qnAs != null ? qnAs.size() : 0;
    }

    public boolean isOwner(String userId) {
        return Objects.equals(this.userId, userId);
    }

    public void edit(CoverLetterAndQnAEditRequest.CoverLetterEditRequest request){
        this.companyName = request.companyName();
        this.applyYear = request.applyYear();
        this.applyHalf = request.applyHalf();
        this.jobPosition = request.jobPosition();
        this.deadline = request.deadline();
    }

    public ReviewRoleType determineReviewRole(String userId) {
        if (isOwner(userId)) {
            return ReviewRoleType.WRITER;
        }
        return ReviewRoleType.REVIEWER;
    }
}
