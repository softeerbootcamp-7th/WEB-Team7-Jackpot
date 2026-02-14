package com.jackpot.narratix.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Objects;

@Entity
@Table(
        name = "review",
        indexes = @Index(name = "idx_qna_id_reviewer_id", columnList = "qna_id, reviewer_id")
)
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review extends BaseTimeEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "qna_id", nullable = false)
    private Long qnaId;

    @NotNull
    @Column(name = "reviewer_id", nullable = false)
    private String reviewerId;

    @Column(name = "comment", nullable = true)
    private String comment;

    @Column(name = "suggest", nullable = true)
    private String suggest;

    @Builder.Default
    @Column(name = "is_approved", nullable = false)
    private boolean isApproved = false;

    public void editSuggest(String suggest) {
        this.suggest = suggest;
    }

    public void editComment(String comment) {
        this.comment = comment;
    }

    public boolean isOwner(String userId) {
        return Objects.equals(this.reviewerId, userId);
    }

    public boolean belongsToQnA(Long qnAId){
        return Objects.equals(this.qnaId, qnAId);
    }
}
