package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.WebSocketErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketMessageSender {

    private final SimpMessagingTemplate messagingTemplate;

    private static final String DESTINATION_PREFIX = "/sub/share/";
    private static final String WRITER_DESTINATION_SUFFIX = "/review/writer";
    private static final String REVIEWER_DESTINATION_SUFFIX = "/review/reviewer";

    public void sendMessageToShare(String shareId, WebSocketMessageResponse message) {
        String writerDestination = getDestination(ReviewRoleType.WRITER, shareId);
        String reviewerDestination = getDestination(ReviewRoleType.REVIEWER, shareId);

        messagingTemplate.convertAndSend(writerDestination, message);
        messagingTemplate.convertAndSend(reviewerDestination, message);
    }

    public void sendMessageToReviewer(String shareId, WebSocketMessageResponse message) {
        String reviewerDestination = getDestination(ReviewRoleType.REVIEWER, shareId);
        log.info("Send Reviewer At {}, message={}", reviewerDestination, message);
        messagingTemplate.convertAndSend(reviewerDestination, message);
    }

    private String getDestination(ReviewRoleType role, String shareId) {

        return switch (role) {
            case REVIEWER -> DESTINATION_PREFIX + shareId + REVIEWER_DESTINATION_SUFFIX;
            case WRITER -> DESTINATION_PREFIX + shareId + WRITER_DESTINATION_SUFFIX;
        };
    }
}
