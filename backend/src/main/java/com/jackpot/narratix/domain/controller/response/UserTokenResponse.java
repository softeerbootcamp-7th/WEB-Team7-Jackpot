package com.jackpot.narratix.domain.controller.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserTokenResponse {
    private String accessToken;
}
