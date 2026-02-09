package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.request.CheckIdRequest;
import com.jackpot.narratix.domain.controller.request.JoinRequest;
import com.jackpot.narratix.domain.controller.request.LoginRequest;
import com.jackpot.narratix.domain.service.UserAuthService;
import com.jackpot.narratix.global.auth.jwt.JwtConstants;
import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import com.jackpot.narratix.global.auth.jwt.service.TokenService;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class UserAuthControllerTest {

    @InjectMocks
    private UserAuthController userAuthController;

    @Mock
    private UserAuthService userAuthService;

    @Mock
    private TokenService tokenService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;

    private static final String TEST_USER_ID = "testuser123";
    private static final String TEST_PASSWORD = "testPassword123!";
    private static final String TEST_NICKNAME = "테스트닉네임";
    private static final String JWT_REFRESH_TOKEN = "refresh.token.here";
    private static final String ACCESS_TOKEN = "access.token.here";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userAuthController).build();
    }

    @Test
    @DisplayName("아이디 중복 확인 성공")
    void checkId_Success() throws Exception {
        // given
        CheckIdRequest request = new CheckIdRequest();
        ReflectionTestUtils.setField(request, "userId", TEST_USER_ID);
        willDoNothing().given(userAuthService).checkIdAvailable(TEST_USER_ID);

        // when & then
        mockMvc.perform(post("/api/v1/auth/checkid")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("회원가입 성공 - Access Token은 Bearer 포함, Refresh Token은 쿠키로 반환")
    void join_Success() throws Exception {
        // given
        JoinRequest request = new JoinRequest();
        ReflectionTestUtils.setField(request, "userId", TEST_USER_ID);
        ReflectionTestUtils.setField(request, "password", TEST_PASSWORD);
        ReflectionTestUtils.setField(request, "passwordConfirm", TEST_PASSWORD);
        ReflectionTestUtils.setField(request, "nickname", TEST_NICKNAME);

        Date now = new Date();
        Date expiration = new Date(now.getTime() + 3600000);
        TokenResponse tokenResponse = TokenResponse.of(
                AccessToken.of(ACCESS_TOKEN, TEST_USER_ID, now, expiration)
                , RefreshToken.of(JWT_REFRESH_TOKEN, TEST_USER_ID, now, expiration)
        );

        given(userAuthService.join(any(JoinRequest.class))).willReturn(tokenResponse);

        // when & then
        mockMvc.perform(post("/api/v1/auth/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value(JwtConstants.BEARER + ACCESS_TOKEN))
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(cookie().value("refreshToken", JWT_REFRESH_TOKEN))
                .andExpect(cookie().httpOnly("refreshToken", true))
                .andExpect(cookie().path("refreshToken", "/"));
    }

    @Test
    @DisplayName("로그인 성공 - Access Token은 Bearer 포함, Refresh Token은 쿠키로 반환")
    void login_Success() throws Exception {
        // given
        LoginRequest request = new LoginRequest();
        ReflectionTestUtils.setField(request, "userId", TEST_USER_ID);
        ReflectionTestUtils.setField(request, "password", TEST_PASSWORD);

        Date now = new Date();
        Date expiration = new Date(now.getTime() + 3600000);
        AccessToken accessToken = AccessToken.of(ACCESS_TOKEN, TEST_USER_ID, now, expiration);
        RefreshToken refreshToken = RefreshToken.of(JWT_REFRESH_TOKEN, TEST_USER_ID, now, expiration);
        TokenResponse tokenResponse = TokenResponse.of(accessToken, refreshToken);

        given(userAuthService.login(any(LoginRequest.class))).willReturn(tokenResponse);

        // when & then
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value(JwtConstants.BEARER + ACCESS_TOKEN))
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(cookie().value("refreshToken", JWT_REFRESH_TOKEN))
                .andExpect(cookie().httpOnly("refreshToken", true))
                .andExpect(cookie().path("refreshToken", "/"));
    }

    @Test
    @DisplayName("Refresh Token으로 Access Token 재발급 성공")
    void refresh_Success() throws Exception {
        // given
        Date now = new Date();
        Date accessExpiration = new Date(now.getTime() + 3600000);
        AccessToken newAccessToken = AccessToken.of("new.access.token", TEST_USER_ID, now, accessExpiration);

        given(tokenService.reissueToken(JWT_REFRESH_TOKEN)).willReturn(newAccessToken);

        // when & then
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .cookie(new Cookie("refreshToken", JWT_REFRESH_TOKEN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("Bearer new.access.token"));
    }

    @Test
    @DisplayName("Refresh Token이 없으면 400 Bad Request 반환")
    void refresh_MissingRefreshToken_BadRequest() throws Exception {
        // when & then
        mockMvc.perform(post("/api/v1/auth/refresh"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("회원가입 시 필수 필드가 null이면 400 Bad Request 반환")
    void join_RequiredFieldNull_BadRequest() throws Exception {
        // given
        JoinRequest request = new JoinRequest();
        ReflectionTestUtils.setField(request, "userId", null);
        ReflectionTestUtils.setField(request, "password", TEST_PASSWORD);
        ReflectionTestUtils.setField(request, "passwordConfirm", TEST_PASSWORD);
        ReflectionTestUtils.setField(request, "nickname", TEST_NICKNAME);

        // when & then
        mockMvc.perform(post("/api/v1/auth/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("로그인 시 필수 필드가 null이면 400 Bad Request 반환")
    void login_RequiredFieldNull_BadRequest() throws Exception {
        // given
        LoginRequest request = new LoginRequest();
        ReflectionTestUtils.setField(request, "userId", null);
        ReflectionTestUtils.setField(request, "password", TEST_PASSWORD);

        // when & then
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("아이디 중복 확인 시 필수 필드가 null이면 400 Bad Request 반환")
    void checkId_RequiredFieldNull_BadRequest() throws Exception {
        // given
        CheckIdRequest request = new CheckIdRequest();
        ReflectionTestUtils.setField(request, "userId", null);

        // when & then
        mockMvc.perform(post("/api/v1/auth/checkid")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}