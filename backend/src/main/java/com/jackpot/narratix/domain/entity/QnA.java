package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "qna")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QnA extends BaseTimeEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coverletter_id", nullable = false)
    private CoverLetter coverLetter;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "question_category", nullable = false)
    private QuestionCategoryType questionCategory;

    @NotNull
    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "answer", nullable = true, columnDefinition = "TEXT")
    private String answer;
}
