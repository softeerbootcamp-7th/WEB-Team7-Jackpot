package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Entity
@Table(name = "coverletter")
@Getter
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

    @Column(name = "deadline", nullable = true)
    private LocalDate deadline;

    @OneToMany(mappedBy = "coverLetter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QnA> qnAs = new ArrayList<>();

    public int getQuestionCount() {
        return qnAs != null ? qnAs.size() : 0;
    }

    public static CoverLetter from(String userId, CreateCoverLetterRequest request) {
        CoverLetter coverLetter = new CoverLetter();
        coverLetter.userId = userId;
        coverLetter.companyName = request.companyName();
        coverLetter.applyYear = request.applyYear();
        coverLetter.applyHalf = request.applyHalf();
        coverLetter.jobPosition = request.jobPosition();
        coverLetter.deadline = request.deadline();
        coverLetter.qnAs = request.questions().stream()
                .map(question -> QnA.newQnA(coverLetter, question))
                .collect(Collectors.toCollection(ArrayList::new));
        return coverLetter;
    }

    public boolean isOwner(String userId) {
        return Objects.equals(this.userId, userId);
    }
}
