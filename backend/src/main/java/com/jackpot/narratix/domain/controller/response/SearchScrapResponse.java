package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;

import java.util.List;

public record SearchScrapResponse(
        List<QnAItem> scraps,
        boolean hasNext
) {
    public record QnAItem(
            Long id,
            String companyName,
            String jobPosition,
            String applySeason,
            String question,
            String answer,
            Long coverLetterId
    ) {
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
                    qna.getAnswer(),
                    coverLetter.getId()
            );
        }
    }

    public static SearchScrapResponse of(List<QnA> qnaItems, boolean hasNext) {
        return new SearchScrapResponse(
                qnaItems.stream()
                        .map(QnAItem::from)
                        .toList(),
                hasNext
        );
    }
}