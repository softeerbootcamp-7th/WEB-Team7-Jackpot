package com.jackpot.narratix.domain.event;

import java.util.List;

public record JobCreatedEvent(
        String jobId,
        String userId,
        List<String> fileIds

) {
}
