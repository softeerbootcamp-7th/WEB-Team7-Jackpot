package com.jackpot.narratix.domain.event;

public record ReviewDeleteEvent(
        Long coverLetterId,
        Long qnAId,
        Long reviewId
) {
}