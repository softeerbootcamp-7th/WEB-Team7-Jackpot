package com.jackpot.narratix.domain.fixture;

import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

public class BaseTimeEntityFixture {

    public static void setAuditFields(Object entity) {
        LocalDateTime now = LocalDateTime.now();
        ReflectionTestUtils.setField(entity, "createdAt", now);
        ReflectionTestUtils.setField(entity, "modifiedAt", now);
    }

    public static void setAuditFields(Object entity, LocalDateTime createdAt, LocalDateTime modifiedAt) {
        ReflectionTestUtils.setField(entity, "createdAt", createdAt);
        ReflectionTestUtils.setField(entity, "modifiedAt", modifiedAt);
    }
}
