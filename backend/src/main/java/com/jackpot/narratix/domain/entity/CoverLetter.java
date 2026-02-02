package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "coverletter")
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class CoverLetter extends BaseTimeEntity{

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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

    public static CoverLetter from(User user, CreateCoverLetterRequest request){
        CoverLetter coverLetter = new CoverLetter();
        coverLetter.user = user;
        coverLetter.companyName = request.companyName();
        coverLetter.applyYear = request.applyYear();
        coverLetter.applyHalf = request.applyHalf();
        coverLetter.jobPosition = request.jobPosition();
        coverLetter.deadline = request.deadline();
        return coverLetter;
    }
}
