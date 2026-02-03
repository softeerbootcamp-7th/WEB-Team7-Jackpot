package com.jackpot.narratix.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "scrap")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Scrap {

    @EmbeddedId
    private ScrapId id;

    public static Scrap of(String userId, Long qnaId) {
        Scrap scrap = new Scrap();
        scrap.id = new ScrapId(userId, qnaId);
        return scrap;
    }
}
