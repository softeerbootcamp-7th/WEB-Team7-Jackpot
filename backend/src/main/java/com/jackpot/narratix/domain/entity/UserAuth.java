package com.jackpot.narratix.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserAuth {

    @Id
    private String userId;

    private String password;

    @Builder
    public UserAuth(String userId, String password) {
        this.userId = userId;
        this.password = password;
    }
}
