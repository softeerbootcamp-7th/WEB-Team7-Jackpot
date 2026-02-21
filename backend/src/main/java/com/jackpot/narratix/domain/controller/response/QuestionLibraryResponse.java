package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;

import java.util.List;

public record QuestionLibraryResponse(
        String questionCategory,
        List<QnAItem> qnAs,
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
            String answer = qna.getAnswer();

            return new QnAItem(
                    qna.getId(),
                    coverLetter.getCompanyName(),
                    coverLetter.getJobPosition(),
                    String.format("%d년 %s",
                            coverLetter.getApplyYear(),
                            coverLetter.getApplyHalf().getDescription()),
                    qna.getQuestion(),
                    answer,
                    coverLetter.getId()
            );
        }
    }

    public static QuestionLibraryResponse of(QuestionCategoryType questionCategory, List<QnAItem> qnAs, boolean hasNext) {
        return new QuestionLibraryResponse(questionCategory.getDescription(), qnAs, hasNext);
    }
}
