package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.dto.CheckIdRequest;
import com.jackpot.narratix.domain.controller.dto.JoinRequest;
import com.jackpot.narratix.domain.controller.dto.LoginRequest;
import com.jackpot.narratix.domain.controller.dto.UserTokenResponse;
import com.jackpot.narratix.domain.service.UserService;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/checkid")
    public ResponseEntity<Void> checkId(@Valid @RequestBody CheckIdRequest request) {
        userService.checkIdAvailable(request.getUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/join")
    public ResponseEntity<UserTokenResponse> join(@Valid @RequestBody JoinRequest request) {
        TokenResponse tokens = userService.join(request);
        return createTokenResponse(tokens);
    }

    @PostMapping("/login")
    public ResponseEntity<UserTokenResponse> login(@Valid @RequestBody LoginRequest request) {
        var tokens = userService.login(request);
        return createTokenResponse(tokens);
    }

    private ResponseEntity<UserTokenResponse> createTokenResponse(TokenResponse tokens) {
        String accessTokenValue = tokens.getAccessToken();
        String refreshTokenValue = tokens.getRefreshToken();


        // TODO: 배포 시 리프레시 토큰 쿠키 보안 속성 추가 필요
        //  - secure(true): HTTPS 환경에서만 전송
        //  - sameSite("Lax" 또는 "Strict"): CSRF 공격 방지
        //  - maxAge(refreshTokenTTL): 토큰 만료 시간과 동기화
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshTokenValue)
                .httpOnly(true)
                .path("/")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new UserTokenResponse(accessTokenValue));
    }
}



