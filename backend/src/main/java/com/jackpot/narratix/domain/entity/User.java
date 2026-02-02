package com.jackpot.narratix.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {

    @Id
    @Column(name = "id")
    private String id;

    @NotNull
    @NotBlank
    @Column(name = "nickname", nullable = false)
    private String nickname;

    public static User createUserReference(String userId) {
        User user = new User();
        user.id = userId;
        return user;
    }
}
