package com.jackpot.narratix.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShareLinkLockRenewalScheduler {

    private final ShareLinkLockManager shareLinkLockManager;

    private static final long LOCK_RENEWAL_TIME = 4 * 1000L;

    @Scheduled(fixedRate = LOCK_RENEWAL_TIME)
    public void renewActiveLocks() {
        try {
            shareLinkLockManager.renewAllLocks();
        } catch (Exception e) {
            log.error("락 갱신 중 예외 발생", e);
        }

    }
}