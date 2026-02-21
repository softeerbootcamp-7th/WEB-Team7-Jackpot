package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.QnA;

public record QnAVersionResponse(
        Long qnAId,
        String question,
        String answer,
        Long version
) {
    public static QnAVersionResponse of(QnA qnA) {
        return new QnAVersionResponse(
                qnA.getId(),
                qnA.getQuestion(),
                qnA.getAnswer(),
                qnA.getVersion()
        );
    }
}
