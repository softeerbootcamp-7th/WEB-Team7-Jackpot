package com.jackpot.narratix.domain.event;

public record TextReplaceAllEvent(
        Long coverLetterId,
        Long qnAId,
        Long version,
        String content
) {
}
