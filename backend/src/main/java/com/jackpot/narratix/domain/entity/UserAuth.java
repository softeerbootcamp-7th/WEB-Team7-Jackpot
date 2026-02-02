package com.jackpot.narratix.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "user_auth")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserAuth extends BaseTimeEntity {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(length = 60, nullable = false)
    @NotNull
    private String password;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Builder
    public UserAuth(User user, String password) {
        this.user = user;
        this.password = password;
    }
}
