package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.QnA;

import java.time.LocalDateTime;

public record QnAResponse(
        Long qnaId,
        String question,
        String answer,
        Integer answerSize,
        LocalDateTime modifiedAt
) {
    public static QnAResponse of(QnA qnA) {
        String answer = (qnA.getAnswer() == null) ? "" : qnA.getAnswer();
        return new QnAResponse(
                qnA.getId(),
                qnA.getQuestion(),
                answer,
                answer.length(),
                qnA.getModifiedAt()
        );
    }
}
