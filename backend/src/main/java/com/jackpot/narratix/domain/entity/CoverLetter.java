package com.jackpot.narratix.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coverletter")
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class CoverLetter extends BaseTimeEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "apply_year", nullable = false)
    private Integer applyYear;

    @Column(name = "apply_half", nullable = false)
    @Enumerated(EnumType.STRING)
    private ApplyHalfType applyHalf;

    @Column(name = "job_position", nullable = false)
    private String jobPosition;

    @Column(name = "deadline", nullable = false)
    private LocalDateTime deadline;
}
