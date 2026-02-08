package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationJpaRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId ORDER BY n.createdAt DESC, n.id DESC")
    Slice<Notification> findRecentByUserId(@Param("userId") String userId, Pageable pageable);


    @Query("""
            SELECT n FROM Notification n
            WHERE n.userId = :userId
            AND n.createdAt < (SELECT n2.createdAt FROM Notification n2 WHERE n2.id = :lastNotificationId)
            ORDER BY n.createdAt DESC, n.id DESC
            """)
    Slice<Notification> findAllByUserIdAfterCursor(
            @Param("userId") String userId,
            @Param("lastNotificationId") Long lastNotificationId,
            Pageable pageable
    );
}
