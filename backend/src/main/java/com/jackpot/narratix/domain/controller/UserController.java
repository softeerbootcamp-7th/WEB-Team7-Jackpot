package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.dto.CheckIdRequest;
import com.jackpot.narratix.domain.controller.dto.JoinRequest;
import com.jackpot.narratix.domain.controller.dto.LoginRequest;
import com.jackpot.narratix.domain.controller.dto.UserTokenResponse;
import com.jackpot.narratix.domain.service.UserService;
import com.jackpot.narratix.global.auth.jwt.service.TokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final TokenService tokenService;

    @PostMapping("/auth")
    public ResponseEntity<Void> checkId(@Valid @RequestBody CheckIdRequest request) {
        if (userService.isIdDuplicated(request.getUserId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다");
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/auth/join")
    public ResponseEntity<UserTokenResponse> join(@Valid @RequestBody JoinRequest request) {
        userService.join(request);
        return createTokenResponse(request.getUserId());
    }

    @PostMapping("/auth/login")
    public ResponseEntity<UserTokenResponse> login(@Valid @RequestBody LoginRequest request) {

        userService.login(request);

        return createTokenResponse(request.getUserId());
    }

    private ResponseEntity<UserTokenResponse> createTokenResponse(String userId) {

        var tokens = tokenService.issueToken(userId);
        String accessTokenValue = tokens.getAccessToken();
        String refreshTokenValue = tokens.getRefreshToken();

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshTokenValue)
                .httpOnly(true)
                .path("/")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new UserTokenResponse(accessTokenValue));
    }
}



