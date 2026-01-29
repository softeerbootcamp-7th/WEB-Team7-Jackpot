package com.jackpot.narratix.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class UserDto {
    @Getter
    @NoArgsConstructor
    public static class JoinRequest {
        private String userId;
        private String password;
        private String passwordConfirm;
        private String nickname;
    }

    @Getter
    @AllArgsConstructor
    public static class TokenResponse {
        private String accessToken;
    }
}
