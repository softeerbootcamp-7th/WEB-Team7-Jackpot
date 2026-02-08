package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.Notification;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.domain.fixture.NotificationFixture;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import java.time.LocalDateTime;
import java.util.List;

import static com.jackpot.narratix.domain.fixture.BaseTimeEntityFixture.setAuditFields;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class NotificationJpaRepositoryTest {

    @Autowired
    private NotificationJpaRepository notificationJpaRepository;

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    @DisplayName("최근 알림 리스트 조회 시 createdAt DESC, id DESC 순으로 정렬되어 조회")
    void findRecentByUserId_OrderByCreatedAtDescIdDesc() {
        // given
        User user = saveUser("testUser123", "테스터");
        String userId = user.getId();

        LocalDateTime baseTime = LocalDateTime.of(2024, 1, 1, 12, 0);

        // 같은 createdAt을 가진 알림 여러 개 생성 (id로 정렬 확인)
        Notification notification1 = createAndSaveNotification(userId, baseTime.minusDays(2), "알림1");
        Notification notification2 = createAndSaveNotification(userId, baseTime.minusDays(1), "알림2");
        Notification notification3 = createAndSaveNotification(userId, baseTime.minusDays(1), "알림3");
        Notification notification4 = createAndSaveNotification(userId, baseTime, "알림4");
        Notification notification5 = createAndSaveNotification(userId, baseTime, "알림5");

        flushAndClear();

        // when
        Pageable pageable = PageRequest.ofSize(10);
        Slice<Notification> slice = notificationJpaRepository.findRecentByUserId(userId, pageable);
        List<Notification> results = slice.getContent();

        // then
        assertThat(results).hasSize(5);

        // createdAt DESC, id DESC 순으로 정렬 확인
        assertThat(results.get(0).getId()).isEqualTo(notification5.getId()); // 최신 시간, 큰 id
        assertThat(results.get(1).getId()).isEqualTo(notification4.getId()); // 최신 시간, 작은 id
        assertThat(results.get(2).getId()).isEqualTo(notification3.getId()); // 중간 시간, 큰 id
        assertThat(results.get(3).getId()).isEqualTo(notification2.getId()); // 중간 시간, 작은 id
        assertThat(results.get(4).getId()).isEqualTo(notification1.getId()); // 가장 오래된 시간
    }

    @Test
    @DisplayName("최근 알림 리스트 조회 시 Pageable size만큼만 조회")
    void findRecentByUserId_LimitByPageableSize() {
        // given
        User user = saveUser("testUser456", "테스터2");
        String userId = user.getId();

        LocalDateTime baseTime = LocalDateTime.now();
        for (int i = 0; i < 10; i++) {
            createAndSaveNotification(userId, baseTime.minusDays(i), "알림" + i);
        }

        flushAndClear();

        // when
        Pageable pageable = PageRequest.ofSize(5);
        Slice<Notification> slice = notificationJpaRepository.findRecentByUserId(userId, pageable);
        List<Notification> results = slice.getContent();

        // then
        assertThat(results).hasSize(5); // size만큼만 조회
    }

    @Test
    @DisplayName("최근 알림 리스트 조회 시 해당 userId의 알림만 조회")
    void findRecentByUserId_FiltersByUserId() {
        // given
        User user = saveUser("testUser789", "테스터3");
        User otherUser = saveUser("testUser000", "테스터4");

        LocalDateTime now = LocalDateTime.now();
        createAndSaveNotification(user.getId(), now, "user1 알림1");
        createAndSaveNotification(user.getId(), now.minusHours(1), "user1 알림2");
        createAndSaveNotification(otherUser.getId(), now, "user2 알림1");
        createAndSaveNotification(otherUser.getId(), now.minusHours(1), "user2 알림2");

        flushAndClear();

        // when
        Pageable pageable = PageRequest.ofSize(10);
        Slice<Notification> slice = notificationJpaRepository.findRecentByUserId(user.getId(), pageable);
        List<Notification> results = slice.getContent();

        // then
        assertThat(results).hasSize(2)
                .allMatch(n -> n.getUserId().equals(user.getId()));
    }

    @Test
    @DisplayName("커서 이후의 알림 리스트 조회 시 cursor(lastNotificationId)의 createdAt보다 이전 데이터만 조회")
    void findAllByUserIdAfterCursor_FiltersAfterCursor() {
        // given
        User user = saveUser("testUser111", "테스터5");
        String userId = user.getId();

        LocalDateTime cursorTime = LocalDateTime.of(2024, 1, 10, 12, 0);

        Notification old1 = createAndSaveNotification(userId, cursorTime.minusDays(2), "오래된 알림1");
        Notification old2 = createAndSaveNotification(userId, cursorTime.minusDays(1), "오래된 알림2");
        Notification cursor = createAndSaveNotification(userId, cursorTime, "커서 알림");
        createAndSaveNotification(userId, cursorTime.plusDays(1), "최근 알림1"); // recent1
        createAndSaveNotification(userId, cursorTime.plusDays(2), "최근 알림2"); // recent 2

        flushAndClear();

        // when - cursor를 기준으로 조회
        Pageable pageable = PageRequest.ofSize(10);
        Slice<Notification> slice = notificationJpaRepository.findAllByUserIdAfterCursor(
                userId, cursor.getId(), pageable
        );
        List<Notification> results = slice.getContent();

        // then - cursor의 createdAt보다 이전 데이터만 조회 (old1, old2만 조회되어야 함)
        assertThat(results).hasSize(2);
        assertThat(results).extracting(Notification::getId)
                .containsExactly(old2.getId(), old1.getId()); // createdAt DESC, id DESC
    }

    @Test
    @DisplayName("커서 이후의 알림 리스트 조회 시 createdAt DESC, id DESC 순으로 정렬")
    void findAllByUserIdAfterCursor_OrderByCreatedAtDescIdDesc() {
        // given
        User user = saveUser("testUser222", "테스터6");
        String userId = user.getId();

        LocalDateTime cursorTime = LocalDateTime.of(2024, 1, 20, 12, 0);
        LocalDateTime sameTime = cursorTime.minusDays(2);


        // 같은 createdAt을 가진 알림들 생성
        Notification n1 = createAndSaveNotification(userId, cursorTime.minusDays(3), "알림1");
        Notification n2 = createAndSaveNotification(userId, sameTime, "알림2");
        Notification n3 = createAndSaveNotification(userId, sameTime, "알림3"); // 같은 시간
        Notification n4 = createAndSaveNotification(userId, cursorTime.minusDays(1), "알림4");
        Notification cursor = createAndSaveNotification(userId, cursorTime, "커서 알림");

        flushAndClear();

        // when
        Pageable pageable = PageRequest.ofSize(10);
        Slice<Notification> slice = notificationJpaRepository.findAllByUserIdAfterCursor(
                userId, cursor.getId(), pageable
        );
        List<Notification> results = slice.getContent();

        // then
        assertThat(results).hasSize(4);
        assertThat(results.get(0).getId()).isEqualTo(n4.getId());
        assertThat(results.get(1).getId()).isEqualTo(n3.getId()); // 같은 createdAt이면 id DESC
        assertThat(results.get(2).getId()).isEqualTo(n2.getId());
        assertThat(results.get(3).getId()).isEqualTo(n1.getId());
    }

    @Test
    @DisplayName("커서 이후의 알림 리스트 조회 시 Pageable size만큼만 조회")
    void findAllByUserIdAfterCursor_LimitByPageableSize() {
        // given
        User user = saveUser("testUser333", "테스터7");
        String userId = user.getId();

        LocalDateTime baseTime = LocalDateTime.now();

        // 10개 생성
        for (int i = 0; i < 10; i++) {
            createAndSaveNotification(userId, baseTime.minusDays(i + 5), "오래된 알림" + i);
        }
        Notification cursor = createAndSaveNotification(userId, baseTime, "커서 알림");

        flushAndClear();

        // when
        Pageable pageable = PageRequest.ofSize(5);
        Slice<Notification> slice = notificationJpaRepository.findAllByUserIdAfterCursor(
                userId, cursor.getId(), pageable
        );
        List<Notification> results = slice.getContent();

        // then
        assertThat(results).hasSize(5); // size만큼만 조회
    }

    @Test
    @DisplayName("커서 이후의 알림 리스트 조회 시 해당 userId의 알림만 조회")
    void findAllByUserIdAfterCursor_FiltersByUserId() {
        // given
        User user = saveUser("testUser444", "테스터8");
        User otherUser = saveUser("testUser555", "테스터9");

        LocalDateTime baseTime = LocalDateTime.of(2024, 1, 15, 12, 0);

        createAndSaveNotification(user.getId(), baseTime.minusDays(5), "user1 오래된 알림1");
        createAndSaveNotification(user.getId(), baseTime.minusDays(4), "user1 오래된 알림2");
        createAndSaveNotification(otherUser.getId(), baseTime.minusDays(5), "user2 오래된 알림1");
        createAndSaveNotification(otherUser.getId(), baseTime.minusDays(4), "user2 오래된 알림2");

        Notification cursor = createAndSaveNotification(user.getId(), baseTime, "user1 커서 알림");

        flushAndClear();

        // when
        Pageable pageable = PageRequest.ofSize(10);
        Slice<Notification> slice = notificationJpaRepository.findAllByUserIdAfterCursor(
                user.getId(), cursor.getId(), pageable
        );
        List<Notification> results = slice.getContent();

        // then
        assertThat(results).hasSize(2)
                .allMatch(n -> n.getUserId().equals(user.getId()));
    }

    private Notification createAndSaveNotification(String userId, LocalDateTime createdAt, String title) {
        Notification notification = NotificationFixture.builder()
                .userId(userId)
                .type(NotificationType.FEEDBACK)
                .title(title)
                .content("테스트 내용")
                .createdAt(createdAt)
                .modifiedAt(createdAt)
                .build();
        return notificationJpaRepository.save(notification);
    }

    private User saveUser(String userId, String nickname) {
        User user = User.builder()
                .id(userId)
                .nickname(nickname)
                .build();
        setAuditFields(user);
        return userJpaRepository.save(user);
    }

    private void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }
}