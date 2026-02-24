package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "labeled_qna")
public class LabeledQnA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upload_file_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private UploadFile uploadFile;

    @NotNull
    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @NotNull
    @Column(columnDefinition = "TEXT", nullable = false)
    private String answer;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_category", nullable = false)
    private QuestionCategoryType questionCategory;

    @Builder
    public LabeledQnA(UploadFile uploadFile, String question, String answer, QuestionCategoryType questionCategory) {
        this.uploadFile = uploadFile;
        this.question = question;
        this.answer = answer;
        this.questionCategory = questionCategory;
    }

    public void connectUploadFile(UploadFile uploadFile) {
        this.uploadFile = uploadFile;
    }
}
