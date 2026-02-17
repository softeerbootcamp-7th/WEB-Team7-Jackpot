package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.QnA;

import java.util.List;

public record QnAListResponse(
        List<QnAResponse> qnAs
) {

    public record QnAResponse(
            Long qnAId,
            String question,
            String category
    ){
        public static QnAResponse of(QnA qnA){
            return new QnAResponse(
                    qnA.getId(),
                    qnA.getQuestion(),
                    qnA.getQuestionCategory().getDescription()
            );
        }
    }
}
