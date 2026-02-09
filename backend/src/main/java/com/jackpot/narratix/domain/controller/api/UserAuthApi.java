package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.request.CheckIdRequest;
import com.jackpot.narratix.domain.controller.request.JoinRequest;
import com.jackpot.narratix.domain.controller.request.LoginRequest;
import com.jackpot.narratix.domain.controller.response.UserTokenResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "사용자 인증", description = "사용자 인증 관련 API")
public interface UserAuthApi {

    @Operation(summary = "아이디 중복 확인", description = "회원가입 시 사용할 아이디의 중복 여부를 확인합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "사용 가능한 아이디"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "409", description = "이미 사용 중인 아이디")
    })
    @PostMapping("/checkid")
    ResponseEntity<Void> checkId(@Valid @RequestBody CheckIdRequest request);

    @Operation(summary = "회원가입", description = "새로운 사용자를 등록하고 액세스 토큰을 발급합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "회원가입 성공",
                    content = @Content(schema = @Schema(implementation = UserTokenResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "409", description = "이미 사용 중인 아이디")
    })
    @PostMapping("/join")
    ResponseEntity<UserTokenResponse> join(@Valid @RequestBody JoinRequest request);

    @Operation(summary = "로그인", description = "사용자 인증 후 액세스 토큰을 발급합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "로그인 성공",
                    content = @Content(schema = @Schema(implementation = UserTokenResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping("/login")
    ResponseEntity<UserTokenResponse> login(@Valid @RequestBody LoginRequest request);

    @Operation(summary = "액세스 토큰 재발급", description = "쿠키의 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "토큰 재발급 성공",
                    content = @Content(schema = @Schema(implementation = UserTokenResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "존재하지 않는 리프레시 토큰"),
            @ApiResponse(responseCode = "401", description = "유효하지 않거나 만료된 토큰")
    })
    @PostMapping("/refresh")
    ResponseEntity<UserTokenResponse> refresh(@CookieValue(value = "refreshToken", required = true) String refreshToken);
}