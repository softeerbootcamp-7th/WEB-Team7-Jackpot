package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.controller.dto.JoinRequest;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.mindrot.jbcrypt.BCrypt;

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
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id")
    private User user;

    public static UserAuth joinNewUser(JoinRequest request) {
        User user = User.builder()
                .id(request.getUserId())
                .nickname(request.getNickname())
                .build();
        return UserAuth.builder()
                .user(user)
                .password(hashPassword(request.getPassword()))
                .build();
    }

    private static String hashPassword(String password){
        final int BCRYPT_SALT_ROUNDS = 11;
        return BCrypt.hashpw(password, BCrypt.gensalt(BCRYPT_SALT_ROUNDS));
    }

    public boolean checkPassword(String password){
        return BCrypt.checkpw(password, this.password);
    }
}
