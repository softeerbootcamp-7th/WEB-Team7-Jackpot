package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.controller.request.CreateQuestionRequest;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Getter
@Table(name = "qna")
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
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    public static QnA newQnA(CoverLetter coverLetter, CreateQuestionRequest request) {
        QnA qna = new QnA();
        qna.coverLetter = coverLetter;
        qna.questionCategory = request.category();
        qna.question = request.question();
        qna.userId = coverLetter.getUserId();
        qna.version = 0L;
        return qna;
    }

    public boolean isOwner(String userId){
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

    public long incrementVersionBy(int deltaCount) {
        this.version += deltaCount;
        return this.version;
    }

    public ReviewRoleType determineReviewRole(String userId) {
        if (isOwner(userId)) {
            return ReviewRoleType.WRITER;
        }
        return ReviewRoleType.REVIEWER;
    }
}
