package com.jackpot.narratix.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
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

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "password", nullable = false)
    private String password;
}
