package com.jackpot.narratix.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Getter
@Embeddable
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ScrapId implements Serializable {

    @Column(name = "user_id")
    private String userId;

    @Column(name = "qna_id")
    private Long qnAId;

}