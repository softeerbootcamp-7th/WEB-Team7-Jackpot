package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.service.PasswordHashUtil;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Getter
@Table(name = "user_auth")
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserAuth extends BaseTimeEntity {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(length = 60, nullable = false)
    @NotNull
    private String password;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "user_id")
    private User user;

    public static UserAuth joinNewUser(String userId, String nickname, String password) {
        User user = User.builder().id(userId).nickname(nickname).build();
        return UserAuth.builder().user(user).password(PasswordHashUtil.hashPassword(password)).build();
    }

    public boolean checkPassword(String plainPassword) {
        return PasswordHashUtil.checkPassword(plainPassword, this.password);
    }
}
