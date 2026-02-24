package com.jackpot.narratix.domain.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class ShareLinkTest {

    @Test
    @DisplayName("공유 활성화 상태이고 만료일이 미래인 경우 isValid는 true를 반환한다")
    void isValid_WhenSharedAndNotExpired_ReturnsTrue() {
        // given
        ShareLink shareLink = ShareLink.newActivatedShareLink(1L);

        // expiresAt을 미래로 설정 (기본적으로 14일 후로 설정되지만 명시적으로 설정)
        LocalDateTime futureTime = LocalDateTime.now().plusDays(7);
        ReflectionTestUtils.setField(shareLink, "expiresAt", futureTime);
        ReflectionTestUtils.setField(shareLink, "isShared", true);

        // when
        boolean result = shareLink.isValid();

        // then
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("공유 활성화 상태이지만 만료일이 과거인 경우 isValid는 false를 반환한다")
    void isValid_WhenSharedButExpired_ReturnsFalse() {
        // given
        ShareLink shareLink = ShareLink.newActivatedShareLink(1L);

        // expiresAt을 과거로 설정 (만료됨)
        LocalDateTime pastTime = LocalDateTime.now().minusDays(1);
        ReflectionTestUtils.setField(shareLink, "expiresAt", pastTime);
        ReflectionTestUtils.setField(shareLink, "isShared", true);

        // when
        boolean result = shareLink.isValid();

        // then
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("공유 비활성화 상태이고 만료일이 미래인 경우 isValid는 false를 반환한다")
    void isValid_WhenNotSharedAndNotExpired_ReturnsFalse() {
        // given
        ShareLink shareLink = ShareLink.newActivatedShareLink(1L);

        // 공유 비활성화
        LocalDateTime futureTime = LocalDateTime.now().plusDays(7);
        ReflectionTestUtils.setField(shareLink, "expiresAt", futureTime);
        ReflectionTestUtils.setField(shareLink, "isShared", false);

        // when
        boolean result = shareLink.isValid();

        // then
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("공유 비활성화 상태이고 만료일도 과거인 경우 isValid는 false를 반환한다")
    void isValid_WhenNotSharedAndExpired_ReturnsFalse() {
        // given
        ShareLink shareLink = ShareLink.newActivatedShareLink(1L);

        // 공유 비활성화 + 만료됨
        LocalDateTime pastTime = LocalDateTime.now().minusDays(1);
        ReflectionTestUtils.setField(shareLink, "expiresAt", pastTime);
        ReflectionTestUtils.setField(shareLink, "isShared", false);

        // when
        boolean result = shareLink.isValid();

        // then
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("activate 호출 시 isShared가 true로 설정되고 만료일이 14일 후로 갱신된다")
    void activate_SetsIsSharedTrueAndExtendsExpiration() {
        // given
        ShareLink shareLink = ShareLink.newActivatedShareLink(1L);

        // 비활성화 및 만료일 과거로 설정
        ReflectionTestUtils.setField(shareLink, "isShared", false);
        LocalDateTime pastTime = LocalDateTime.now().minusDays(1);
        ReflectionTestUtils.setField(shareLink, "expiresAt", pastTime);

        // when
        LocalDateTime beforeActivate = LocalDateTime.now();
        shareLink.activate();
        LocalDateTime afterActivate = LocalDateTime.now().plusDays(14);

        // then
        assertThat(shareLink.isValid()).isTrue();
        assertThat(shareLink.getExpiresAt()).isAfter(beforeActivate);
        assertThat(shareLink.getExpiresAt()).isBeforeOrEqualTo(afterActivate);
    }

    @Test
    @DisplayName("deactivate 호출 시 isShared가 false로 설정되어 isValid는 false를 반환한다")
    void deactivate_SetsIsSharedFalse() {
        // given
        ShareLink shareLink = ShareLink.newActivatedShareLink(1L);

        // 초기 상태 확인 (활성화 상태)
        assertThat(shareLink.isValid()).isTrue();

        // when
        shareLink.deactivate();

        // then
        assertThat(shareLink.isValid()).isFalse();
    }
}