package com.jackpot.narratix.domain.service.dto;

import lombok.Getter;

@Getter
public class SessionEntry {
    private final String lockKey;
    private final String userId;
    private volatile long lastActiveTime;

    public SessionEntry(String lockKey, String userId) {
        this.lockKey = lockKey;
        this.userId = userId;
        this.lastActiveTime = System.currentTimeMillis();
    }

    public void updateActiveTime() {
        this.lastActiveTime = System.currentTimeMillis();
    }
}
