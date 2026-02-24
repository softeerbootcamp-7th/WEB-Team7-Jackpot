package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;

import java.util.List;
import java.util.Map;

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
        public static QnAItem of(QnA qna, CoverLetter coverLetter) {
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

    public static SearchScrapResponse of(
            List<QnA> qnaItems,
            Map<Long, CoverLetter> coverLetterMap,
            boolean hasNext
    ) {
        return new SearchScrapResponse(
                qnaItems.stream()
                        .map(qna -> {
                            CoverLetter realCoverLetter = coverLetterMap.get(qna.getCoverLetter().getId());
                            return QnAItem.of(qna, realCoverLetter);
                        })
                        .toList(),
                hasNext
        );
    }
}