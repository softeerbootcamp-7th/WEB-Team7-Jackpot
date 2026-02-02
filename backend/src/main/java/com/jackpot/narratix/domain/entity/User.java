package com.jackpot.narratix.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {

    @Id
    @Column(length = 12, nullable = false)
    private String id;

    @Column(length = 15, nullable = false)
    private String nickname;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private UserAuth userAuth;

    @Builder
    public User(String id, String nickname) {
        this.id = id;
        this.nickname = nickname;
    }

    public void addAuth(String password) {
        this.userAuth = UserAuth.builder()
                .user(this)
                .password(password)
                .build();
    }

}
