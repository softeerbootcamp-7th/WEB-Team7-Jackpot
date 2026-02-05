package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;

import java.util.List;

public record QuestionLibraryResponse(
        List<QnAItem> qnAs,
        boolean hasNext
) {
    public record QnAItem(
            Long id,
            String companyName,
            String jobPosition,
            String applySeason,
            String question,
            String answer
    ) {
    }

    public static QnAItem from(QnA qna) {
        CoverLetter coverLetter = qna.getCoverLetter();

        return new QnAItem(
                qna.getId(),
                coverLetter.getCompanyName(),
                coverLetter.getJobPosition(),
                String.format("%d년 %s",
                        coverLetter.getApplyYear(),
                        coverLetter.getApplyHalf().getDescription()),
                qna.getQuestion(),
                qna.getAnswer()
        );
    }

    public static QuestionLibraryResponse of(List<QnAItem> qnAs, boolean hasNext) {
        return new QuestionLibraryResponse(qnAs, hasNext);
    }
}
