package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.api.UserAuthApi;
import com.jackpot.narratix.domain.controller.request.CheckIdRequest;
import com.jackpot.narratix.domain.controller.request.JoinRequest;
import com.jackpot.narratix.domain.controller.request.LoginRequest;
import com.jackpot.narratix.domain.controller.response.UserTokenResponse;
import com.jackpot.narratix.domain.service.UserAuthService;
import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.service.TokenService;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserAuthController implements UserAuthApi {

    private final UserAuthService userAuthService;
    private final TokenService tokenService;

    @Override
    public ResponseEntity<Void> checkId(@Valid @RequestBody CheckIdRequest request) {
        userAuthService.checkIdAvailable(request.getUserId());
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<UserTokenResponse> join(@Valid @RequestBody JoinRequest request) {
        TokenResponse tokens = userAuthService.join(request);
        return createTokenResponse(tokens);
    }

    @Override
    public ResponseEntity<UserTokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokens = userAuthService.login(request);
        return createTokenResponse(tokens);
    }

    @Override
    public ResponseEntity<UserTokenResponse> refresh(@CookieValue(value = "refreshToken", required = true) String refreshToken) {
        AccessToken accessToken = tokenService.reissueToken(refreshToken);
        return ResponseEntity.ok(new UserTokenResponse(accessToken.getToken()));
    }

    private ResponseEntity<UserTokenResponse> createTokenResponse(TokenResponse tokens) {
        String accessTokenValue = tokens.getAccessToken();
        String refreshTokenValue = tokens.getRefreshToken();

        // TODO: 배포 시 리프레시 토큰 쿠키 보안 속성 추가 필요
        //  - maxAge(refreshTokenTTL): 토큰 만료 시간과 동기화
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshTokenValue)
                .httpOnly(true)
                .secure(true)
                .sameSite("None") //  - sameSite("Lax" 또는 "Strict"): CSRF 공격 방지
                .path("/")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new UserTokenResponse(accessTokenValue));
    }

    @Override
    public ResponseEntity<Void> logout(@CookieValue(value = "refreshToken", required = false) String refreshToken) {

        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")  //  - sameSite("Lax" 또는 "Strict"): CSRF 공격 방지
                .path("/")
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }
}



