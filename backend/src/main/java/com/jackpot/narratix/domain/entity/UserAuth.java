package com.jackpot.narratix.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
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

    @Column(length = 60, nullable = false)
    private String password;

    @OneToOne
    @MapsId
    @JoinColumn(name = "userId")
    private User user;

    @Builder
    public UserAuth(String password) {
        this.password = password;
    }

    void setUser(User user) {
        this.user = user;
    }
}
