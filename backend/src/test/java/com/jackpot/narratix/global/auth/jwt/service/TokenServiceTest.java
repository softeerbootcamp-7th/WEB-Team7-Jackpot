package com.jackpot.narratix.global.auth.jwt.service;

import com.jackpot.narratix.global.auth.jwt.domain.AccessToken;
import com.jackpot.narratix.global.auth.jwt.domain.RefreshToken;
import com.jackpot.narratix.global.auth.jwt.service.dto.TokenResponse;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @Mock
    private JwtProvider jwtProvider;

    @Mock
    private JwtValidator jwtValidator;

    @InjectMocks
    private TokenService tokenService;

    private static final String BEARER_REFRESH_TOKEN = "Bearer refresh.token.here";
    private static final String TEST_USER_ID = "testUser123";

    @Test
    void 토큰_발급_성공() {
        // given
        Date now = new Date();
        Date accessExpiration = new Date(now.getTime() + 3600000);
        Date refreshExpiration = new Date(now.getTime() + 604800000);

        AccessToken accessToken = AccessToken.of("access.token", TEST_USER_ID, now, accessExpiration);
        RefreshToken refreshToken = RefreshToken.of("refresh.token", TEST_USER_ID, now, refreshExpiration);
        TokenResponse expectedResponse = TokenResponse.of(accessToken, refreshToken);

        given(jwtProvider.issueToken(TEST_USER_ID)).willReturn(expectedResponse);

        // when
        TokenResponse result = tokenService.issueToken(TEST_USER_ID);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getAccessToken()).isEqualTo("access.token");
        assertThat(result.getRefreshToken()).isEqualTo("refresh.token");

        then(jwtProvider).should(times(1)).issueToken(TEST_USER_ID);
    }

    @Test
    void RefreshToken으로_재발급_성공() {
        // given
        Date now = new Date();
        Date refreshExpiration = new Date(now.getTime() + 604800000);

        RefreshToken parsedRefreshToken = RefreshToken.of("refresh.token", TEST_USER_ID, now, refreshExpiration);
        RefreshToken newRefreshToken = RefreshToken.of("new.refresh.token", TEST_USER_ID, now, refreshExpiration);

        willDoNothing().given(jwtValidator).validateRefreshToken(BEARER_REFRESH_TOKEN);
        given(jwtProvider.parseRefreshToken(BEARER_REFRESH_TOKEN)).willReturn(parsedRefreshToken);
        given(jwtProvider.reissueToken(TEST_USER_ID)).willReturn(newRefreshToken);

        // when
        RefreshToken result = tokenService.reissueToken(BEARER_REFRESH_TOKEN);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo("new.refresh.token");
        assertThat(result.getSubject()).isEqualTo(TEST_USER_ID);

        then(jwtValidator).should(times(1)).validateRefreshToken(BEARER_REFRESH_TOKEN);
        then(jwtProvider).should(times(1)).parseRefreshToken(BEARER_REFRESH_TOKEN);
        then(jwtProvider).should(times(1)).reissueToken(TEST_USER_ID);
    }

    @Test
    void 유효하지_않은_RefreshToken으로_재발급_실패() {
        // given
        willThrow(new JwtException("Invalid refresh token"))
                .given(jwtValidator).validateRefreshToken(BEARER_REFRESH_TOKEN);

        // when & then
        assertThatThrownBy(() -> tokenService.reissueToken(BEARER_REFRESH_TOKEN))
                .isInstanceOf(JwtException.class)
                .hasMessageContaining("Invalid refresh token");

        then(jwtValidator).should(times(1)).validateRefreshToken(BEARER_REFRESH_TOKEN);
        then(jwtProvider).should(never()).parseRefreshToken(anyString());
        then(jwtProvider).should(never()).reissueToken(anyString());
    }

    @Test
    void 만료된_RefreshToken으로_재발급_실패() {
        // given
        willThrow(new JwtException("Expired refresh token"))
                .given(jwtValidator).validateRefreshToken(BEARER_REFRESH_TOKEN);

        // when & then
        assertThatThrownBy(() -> tokenService.reissueToken(BEARER_REFRESH_TOKEN))
                .isInstanceOf(JwtException.class)
                .hasMessageContaining("Expired refresh token");

        then(jwtValidator).should(times(1)).validateRefreshToken(BEARER_REFRESH_TOKEN);
        then(jwtProvider).should(never()).parseRefreshToken(anyString());
        then(jwtProvider).should(never()).reissueToken(anyString());
    }

    @Test
    void 토큰_재발급_시_올바른_순서로_메서드_호출() {
        // given
        Date now = new Date();
        Date refreshExpiration = new Date(now.getTime() + 604800000);

        RefreshToken parsedRefreshToken = RefreshToken.of("refresh.token", TEST_USER_ID, now, refreshExpiration);
        RefreshToken newRefreshToken = RefreshToken.of("new.refresh.token", TEST_USER_ID, now, refreshExpiration);

        willDoNothing().given(jwtValidator).validateRefreshToken(BEARER_REFRESH_TOKEN);
        given(jwtProvider.parseRefreshToken(BEARER_REFRESH_TOKEN)).willReturn(parsedRefreshToken);
        given(jwtProvider.reissueToken(TEST_USER_ID)).willReturn(newRefreshToken);

        // when
        tokenService.reissueToken(BEARER_REFRESH_TOKEN);

        // then
        var inOrder = inOrder(jwtValidator, jwtProvider);
        then(jwtValidator).should(inOrder).validateRefreshToken(BEARER_REFRESH_TOKEN);
        then(jwtProvider).should(inOrder).parseRefreshToken(BEARER_REFRESH_TOKEN);
        then(jwtProvider).should(inOrder).reissueToken(TEST_USER_ID);
    }

    @Test
    void 파싱된_RefreshToken에서_올바른_subject_추출() {
        // given
        String expectedUserId = "user@example.com";
        Date now = new Date();
        Date refreshExpiration = new Date(now.getTime() + 604800000);

        RefreshToken parsedRefreshToken = RefreshToken.of("refresh.token", expectedUserId, now, refreshExpiration);
        RefreshToken newRefreshToken = RefreshToken.of("new.refresh.token", expectedUserId, now, refreshExpiration);

        willDoNothing().given(jwtValidator).validateRefreshToken(BEARER_REFRESH_TOKEN);
        given(jwtProvider.parseRefreshToken(BEARER_REFRESH_TOKEN)).willReturn(parsedRefreshToken);
        given(jwtProvider.reissueToken(expectedUserId)).willReturn(newRefreshToken);

        // when
        RefreshToken result = tokenService.reissueToken(BEARER_REFRESH_TOKEN);

        // then
        assertThat(result.getSubject()).isEqualTo(expectedUserId);
        then(jwtProvider).should(times(1)).reissueToken(expectedUserId);
    }

    @Test
    void 여러_사용자에_대한_토큰_발급() {
        // given
        String user1 = "user1";
        String user2 = "user2";

        Date now = new Date();
        Date accessExpiration = new Date(now.getTime() + 3600000);
        Date refreshExpiration = new Date(now.getTime() + 604800000);

        AccessToken accessToken1 = AccessToken.of("access1", user1, now, accessExpiration);
        RefreshToken refreshToken1 = RefreshToken.of("refresh1", user1, now, refreshExpiration);
        TokenResponse response1 = TokenResponse.of(accessToken1, refreshToken1);

        AccessToken accessToken2 = AccessToken.of("access2", user2, now, accessExpiration);
        RefreshToken refreshToken2 = RefreshToken.of("refresh2", user2, now, refreshExpiration);
        TokenResponse response2 = TokenResponse.of(accessToken2, refreshToken2);

        given(jwtProvider.issueToken(user1)).willReturn(response1);
        given(jwtProvider.issueToken(user2)).willReturn(response2);

        // when
        TokenResponse result1 = tokenService.issueToken(user1);
        TokenResponse result2 = tokenService.issueToken(user2);

        // then
        assertThat(result1.getAccessToken()).isEqualTo("access1");
        assertThat(result1.getRefreshToken()).isEqualTo("refresh1");
        assertThat(result2.getAccessToken()).isEqualTo("access2");
        assertThat(result2.getRefreshToken()).isEqualTo("refresh2");

        then(jwtProvider).should(times(1)).issueToken(user1);
        then(jwtProvider).should(times(1)).issueToken(user2);
    }
}