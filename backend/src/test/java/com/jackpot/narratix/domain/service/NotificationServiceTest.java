package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.NotificationsPaginationResponse;
import com.jackpot.narratix.domain.entity.Notification;
import com.jackpot.narratix.domain.repository.NotificationRepository;
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
        int fetchLimit = size + 1;
        Optional<Long> lastNotificationId = Optional.empty();

        List<Notification> mockNotifications = createMockNotifications(5);
        Slice<Notification> mockSlice = new SliceImpl<>(mockNotifications, PageRequest.ofSize(fetchLimit), false);
        given(notificationRepository.findRecentByUserId(userId, fetchLimit)).willReturn(mockSlice);

        // when
        notificationService.getNotificationsByUserId(userId, lastNotificationId, size);

        // then
        verify(notificationRepository, times(1)).findRecentByUserId(userId, fetchLimit);
        verify(notificationRepository, never()).findAllByUserId(any(), any(), any());
    }

    @Test
    @DisplayName("lastNotificationId가 있을 때 findAllByUserId 호출")
    void getNotificationsByUserId_lastNotificationIdPresent_callsFindAllByUserId() {
        // given
        String userId = "testUser123";
        int size = 10;
        int fetchLimit = size + 1;
        Long lastNotificationId = 100L;
        Optional<Long> lastNotificationIdOptional = Optional.of(lastNotificationId);

        List<Notification> mockNotifications = createMockNotifications(5);
        Slice<Notification> mockSlice = new SliceImpl<>(mockNotifications, PageRequest.ofSize(fetchLimit), false);
        given(notificationRepository.findAllByUserId(userId, lastNotificationId, fetchLimit)).willReturn(mockSlice);

        // when
        notificationService.getNotificationsByUserId(userId, lastNotificationIdOptional, size);

        // then
        verify(notificationRepository, times(1)).findAllByUserId(userId, lastNotificationId, fetchLimit);
        verify(notificationRepository, never()).findRecentByUserId(any(), any());
    }

    @Test
    @DisplayName("조회된 데이터 개수가 fetchLimit(size+1)와 같으면 hasNext는 true")
    void getNotificationsByUserId_resultSizeEqualsFetchLimit_hasNextIsTrue() {
        // given
        String userId = "testUser123";
        int size = 10;
        int fetchLimit = size + 1;
        Optional<Long> lastNotificationId = Optional.empty();

        // fetchLimit(11)개 조회됨 - 다음 페이지가 있음을 의미
        List<Notification> mockNotifications = createMockNotifications(fetchLimit);
        Slice<Notification> mockSlice = new SliceImpl<>(mockNotifications, PageRequest.ofSize(fetchLimit), true);
        given(notificationRepository.findRecentByUserId(userId, fetchLimit)).willReturn(mockSlice);

        // when
        NotificationsPaginationResponse response = notificationService.getNotificationsByUserId(
                userId, lastNotificationId, size
        );

        // then
        assertThat(response.hasNext()).isTrue();
        assertThat(response.notifications()).hasSize(size); // 실제 반환은 size(10)개만
    }

    @Test
    @DisplayName("조회된 데이터 개수가 fetchLimit(size+1)보다 작으면 hasNext는 false")
    void getNotificationsByUserId_resultSizeLessThanFetchLimit_hasNextIsFalse() {
        // given
        String userId = "testUser123";
        int size = 10;
        int fetchLimit = size + 1;
        Optional<Long> lastNotificationId = Optional.empty();

        // fetchLimit(11)보다 작은 5개만 조회됨 - 마지막 페이지임을 의미
        List<Notification> mockNotifications = createMockNotifications(5);
        Slice<Notification> mockSlice = new SliceImpl<>(mockNotifications, PageRequest.ofSize(fetchLimit), false);
        given(notificationRepository.findRecentByUserId(userId, fetchLimit)).willReturn(mockSlice);

        // when
        NotificationsPaginationResponse response = notificationService.getNotificationsByUserId(
                userId, lastNotificationId, size
        );

        // then
        assertThat(response.hasNext()).isFalse();
        assertThat(response.notifications()).hasSize(5); // 조회된 5개 모두 반환
    }

    @Test
    @DisplayName("lastNotificationId가 있을 때도 size개만 반환")
    void getNotificationsByUserId_withLastNotificationId_returnsSizeItems() {
        // given
        String userId = "testUser123";
        int size = 5;
        int fetchLimit = size + 1;
        Long lastNotificationId = 100L;
        Optional<Long> lastNotificationIdOptional = Optional.of(lastNotificationId);

        // fetchLimit(6)개 조회됨
        List<Notification> mockNotifications = createMockNotifications(fetchLimit);
        Slice<Notification> mockSlice = new SliceImpl<>(mockNotifications, PageRequest.ofSize(fetchLimit), true);
        given(notificationRepository.findAllByUserId(userId, lastNotificationId, fetchLimit))
                .willReturn(mockSlice);

        // when
        NotificationsPaginationResponse response = notificationService.getNotificationsByUserId(
                userId, lastNotificationIdOptional, size
        );

        // then
        assertThat(response.notifications()).hasSize(size); // size(5)개만 반환
        assertThat(response.hasNext()).isTrue();
        verify(notificationRepository, times(1)).findAllByUserId(userId, lastNotificationId, fetchLimit);
    }
}