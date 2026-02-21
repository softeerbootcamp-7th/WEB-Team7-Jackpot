package com.jackpot.narratix.domain.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "scrap")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Scrap extends BaseTimeEntity {

    @EmbeddedId
    private ScrapId id;

    public static Scrap of(String userId, Long qnAId) {
        Scrap scrap = new Scrap();
        scrap.id = new ScrapId(userId, qnAId);
        return scrap;
    }
}
