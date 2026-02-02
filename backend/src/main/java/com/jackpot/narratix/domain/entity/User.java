package com.jackpot.narratix.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    public void setUserAuth(UserAuth userAuth) {
        this.userAuth = userAuth;
        userAuth.setUser(this);
    }
}
