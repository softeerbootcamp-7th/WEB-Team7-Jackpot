package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.UnreadNotificationCountResponse;
import com.jackpot.narratix.domain.entity.Notification;
import com.jackpot.narratix.domain.fixture.NotificationFixture;
import com.jackpot.narratix.domain.repository.NotificationRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;

import java.util.List;
import java.util.Optional;

import static com.jackpot.narratix.domain.fixture.NotificationFixture.createMockNotifications;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @InjectMocks
    private NotificationService notificationService;

    @Mock
    private NotificationRepository notificationRepository;

    @Test
    @DisplayName("lastNotificationId가 없을 때 findRecentByUserId 호출")
    void getNotificationsByUserId_lastNotificationIdAbsent_callsFindRecentByUserId() {
        // given
        String userId = "testUser123";
        int size = 10;
        Optional<Long> lastNotificationId = Optional.empty();

        List<Notification> mockNotifications = createMockNotifications(5);
        Slice<Notification> mockSlice = new SliceImpl<>(mockNotifications, PageRequest.ofSize(size), false);
        given(notificationRepository.findRecentByUserId(userId, size)).willReturn(mockSlice);

        // when
        notificationService.getNotificationsByUserId(userId, lastNotificationId, size);

        // then
        verify(notificationRepository, times(1)).findRecentByUserId(userId, size);
        verify(notificationRepository, never()).findAllByUserId(any(), any(), any());
    }

    @Test
    @DisplayName("lastNotificationId가 있을 때 findAllByUserId 호출")
    void getNotificationsByUserId_lastNotificationIdPresent_callsFindAllByUserId() {
        // given
        String userId = "testUser123";
        int size = 10;
        Long lastNotificationId = 100L;
        Optional<Long> lastNotificationIdOptional = Optional.of(lastNotificationId);

        List<Notification> mockNotifications = createMockNotifications(5);
        Slice<Notification> mockSlice = new SliceImpl<>(mockNotifications, PageRequest.ofSize(size), false);
        given(notificationRepository.findAllByUserId(userId, lastNotificationId, size)).willReturn(mockSlice);

        // when
        notificationService.getNotificationsByUserId(userId, lastNotificationIdOptional, size);

        // then
        verify(notificationRepository, times(1)).findAllByUserId(userId, lastNotificationId, size);
        verify(notificationRepository, never()).findRecentByUserId(any(), any());
    }

    @Test
    @DisplayName("알림 읽음 처리 성공")
    void markNotificationAsRead_Success() {
        // given
        String userId = "testUser123";
        Long notificationId = 1L;
        Notification notification = NotificationFixture.builder()
                .id(notificationId)
                .userId(userId)
                .isRead(false)
                .build();

        given(notificationRepository.findByIdOrElseThrow(notificationId)).willReturn(notification);

        // when
        notificationService.markNotificationAsRead(userId, notificationId);

        // then
        assertThat(notification.isRead()).isTrue();
        verify(notificationRepository, times(1)).findByIdOrElseThrow(notificationId);
    }

    @Test
    @DisplayName("알림 읽음 처리 시 다른 사용자의 알림은 에러를 발생시킨다.")
    void markNotificationAsRead_ThrowsException_WhenNotOwner() {
        // given
        String userId = "testUser123";
        String otherUserId = "otherUser456";
        Long notificationId = 1L;
        Notification notification = NotificationFixture.builder()
                .id(notificationId)
                .userId(otherUserId)
                .isRead(false)
                .build();

        given(notificationRepository.findByIdOrElseThrow(notificationId)).willReturn(notification);

        // when & then
        assertThatThrownBy(() -> notificationService.markNotificationAsRead(userId, notificationId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        assertThat(notification.isRead()).isFalse(); // 읽음 처리되지 않음
        verify(notificationRepository, times(1)).findByIdOrElseThrow(notificationId);
    }

    @Test
    @DisplayName("모든 알림 읽음 처리 성공")
    void markAllNotificationAsRead_Success() {
        // given
        String userId = "testUser123";
        doNothing().when(notificationRepository).updateAllNotificationAsReadByUserId(userId);

        // when
        notificationService.markAllNotificationAsRead(userId);

        // then
        verify(notificationRepository, times(1)).updateAllNotificationAsReadByUserId(userId);
    }

    @Test
    @DisplayName("읽지 않은 알림 개수 조회 성공")
    void countUnreadNotification_Success() {
        // given
        String userId = "testUser123";
        long expectedCount = 5L;
        given(notificationRepository.countByUserIdAndIsRead(userId, false)).willReturn(expectedCount);

        // when
        UnreadNotificationCountResponse response = notificationService.countUnreadNotification(userId);

        // then
        assertThat(response.unreadNotificationCount()).isEqualTo(expectedCount);
        verify(notificationRepository, times(1)).countByUserIdAndIsRead(userId, false);
    }
}