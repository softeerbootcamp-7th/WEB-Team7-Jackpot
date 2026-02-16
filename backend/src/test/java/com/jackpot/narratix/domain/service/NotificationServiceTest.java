package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.UnreadNotificationCountResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.Notification;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.entity.notification_meta.FeedbackNotificationMeta;
import com.jackpot.narratix.domain.event.NotificationSendEvent;
import com.jackpot.narratix.domain.fixture.CoverLetterFixture;
import com.jackpot.narratix.domain.fixture.NotificationFixture;
import com.jackpot.narratix.domain.fixture.QnAFixture;
import com.jackpot.narratix.domain.fixture.UserFixture;
import com.jackpot.narratix.domain.repository.NotificationRepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
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
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

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

    @Test
    @DisplayName("피드백 알림 전송 - 올바른 알림이 생성된다")
    void sendFeedbackNotificationToWriter_CreatesCorrectNotification() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;
        String originText = "원본 텍스트";

        User reviewer = UserFixture.builder()
                .id(reviewerId)
                .nickname("리뷰어닉네임")
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .companyName("카카오")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.SECOND_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        given(userRepository.findByIdOrElseThrow(reviewerId)).willReturn(reviewer);

        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);

        // when
        notificationService.sendFeedbackNotificationToWriter(reviewerId, qnA, originText);

        // then
        verify(userRepository).findByIdOrElseThrow(reviewerId);
        verify(notificationRepository).save(notificationCaptor.capture());
        verify(eventPublisher).publishEvent(any(NotificationSendEvent.class));

        Notification savedNotification = notificationCaptor.getValue();
        assertThat(savedNotification.getUserId()).isEqualTo(writerId);
        assertThat(savedNotification.getType()).isEqualTo(NotificationType.FEEDBACK);
        assertThat(savedNotification.getTitle()).isEqualTo("카카오 2024 하반기");
        assertThat(savedNotification.getContent()).isEqualTo(originText);
        assertThat(savedNotification.getMeta()).isInstanceOf(FeedbackNotificationMeta.class);

        FeedbackNotificationMeta meta = (FeedbackNotificationMeta) savedNotification.getMeta();
        assertThat(meta.getSender().getId()).isEqualTo(reviewerId);
        assertThat(meta.getSender().getNickname()).isEqualTo("리뷰어닉네임");
        assertThat(meta.getQnAId()).isEqualTo(qnaId);
    }

    @Test
    @DisplayName("피드백 알림 전송 - writer에게 알림을 전송하고 reviewer는 sender이다")
    void sendFeedbackNotificationToWriter_ReviewerIsSenderAndWriterReceivesNotification() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;

        User reviewer = UserFixture.builder()
                .id(reviewerId)
                .nickname("리뷰어닉네임")
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .companyName("토스")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        given(userRepository.findByIdOrElseThrow(reviewerId)).willReturn(reviewer);

        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);

        // when
        notificationService.sendFeedbackNotificationToWriter(reviewerId, qnA, "원본 텍스트");

        // then
        // 1. writer에게 알림이 저장된다
        verify(notificationRepository).save(notificationCaptor.capture());
        Notification savedNotification = notificationCaptor.getValue();
        assertThat(savedNotification.getUserId()).isEqualTo(writerId);

        // 2. reviewer는 알림의 sender이다
        assertThat(savedNotification.getMeta()).isInstanceOf(FeedbackNotificationMeta.class);
        FeedbackNotificationMeta meta = (FeedbackNotificationMeta) savedNotification.getMeta();
        assertThat(meta.getSender().getId()).isEqualTo(reviewerId);
        assertThat(meta.getSender().getNickname()).isEqualTo("리뷰어닉네임");
    }

    @Test
    @DisplayName("피드백 알림 전송 - originText가 알림 content에 포함된다")
    void sendFeedbackNotificationToWriter_IncludesOriginTextInNotificationContent() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;
        String originText = "원본 텍스트";

        User reviewer = UserFixture.builder()
                .id(reviewerId)
                .nickname("리뷰어")
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .companyName("네이버")
                .applyYear(2025)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        given(userRepository.findByIdOrElseThrow(reviewerId)).willReturn(reviewer);

        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);

        // when
        notificationService.sendFeedbackNotificationToWriter(reviewerId, qnA, originText);

        // then
        verify(notificationRepository).save(notificationCaptor.capture());

        Notification savedNotification = notificationCaptor.getValue();
        assertThat(savedNotification.getContent()).isEqualTo(originText);
    }
}