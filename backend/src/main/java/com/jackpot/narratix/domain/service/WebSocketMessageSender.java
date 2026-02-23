package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.WebSocketMessageResponse;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.global.websocket.RedisPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketMessageSender {

    private final RedisPublisher redisPublisher;

    private static final String DESTINATION_PATTERN = "/sub/share/%s/qna/%s/review/%s";

    public void sendMessageToShare(String shareId, WebSocketMessageResponse message) {
        String writerDestination = getDestination(ReviewRoleType.WRITER, shareId, message.qnAId());
        String reviewerDestination = getDestination(ReviewRoleType.REVIEWER, shareId, message.qnAId());

        redisPublisher.publish(writerDestination, message);
        redisPublisher.publish(reviewerDestination, message);
    }

    public void sendMessageToReviewer(String shareId, WebSocketMessageResponse message) {
        String reviewerDestination = getDestination(ReviewRoleType.REVIEWER, shareId, message.qnAId());
        log.info("Send Reviewer At {}, message={}", reviewerDestination, message);
        redisPublisher.publish(reviewerDestination, message);
    }

    private String getDestination(ReviewRoleType role, String shareId, Long qnAId) {
        return DESTINATION_PATTERN.formatted(shareId, qnAId, role.name().toLowerCase());
    }
}