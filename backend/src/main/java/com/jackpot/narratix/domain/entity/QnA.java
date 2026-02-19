package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Getter
@Table(name = "qna")
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PUBLIC)
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
    @Column(name = "user_id", nullable = false)
    private String userId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "question_category", nullable = false)
    private QuestionCategoryType questionCategory;

    @NotNull
    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String question;

    @Nullable
    @Column(name = "answer", nullable = true, columnDefinition = "TEXT")
    private String answer;

    @NotNull
    @Builder.Default
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    public void connectCoverLetter(CoverLetter coverLetter) {
        this.coverLetter = coverLetter;
    }

    public boolean isOwner(String userId) {
        return Objects.equals(this.userId, userId);
    }

    public void editAnswer(String answer) {
        this.answer = answer;
        updateModifiedAt(LocalDateTime.now());
    }

    public void editQuestion(String question, QuestionCategoryType category) {
        this.question = question;
        this.questionCategory = category;
        updateModifiedAt(LocalDateTime.now());
    }

    public ReviewRoleType determineReviewRole(String userId) {
        if (isOwner(userId)) {
            return ReviewRoleType.WRITER;
        }
        return ReviewRoleType.REVIEWER;
    }
}
