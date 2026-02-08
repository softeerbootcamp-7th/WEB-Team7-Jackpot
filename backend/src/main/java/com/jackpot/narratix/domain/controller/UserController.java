package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.api.UserApi;
import com.jackpot.narratix.domain.controller.response.UserNicknameResponse;
import com.jackpot.narratix.domain.service.UserService;
import com.jackpot.narratix.global.auth.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController implements UserApi {

    private final UserService userService;

    @Override
    public ResponseEntity<UserNicknameResponse> getNickname(@UserId String userId) {
        return ResponseEntity.ok(userService.getNickname(userId));
    }
}
