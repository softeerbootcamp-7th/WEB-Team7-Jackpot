package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;

import java.util.List;

public record SearchLibraryAndQnAResponse(
        Integer libraryCount,
        List<String> libraries,

        Long qnACount,
        List<QnAItem> qnAs,

        Boolean hasNext
) {
    public record QnAItem(
            Long id,
            String companyName,
            String jobPosition,
            String applySeason,
            String question,
            String answer,
            Long coverLetterId,
            QuestionCategoryType questionCategoryType

    ) {
        public static QnAItem from(QnA qnA) {
            CoverLetter coverLetter = qnA.getCoverLetter();

            return new QnAItem(
                    qnA.getId(),
                    coverLetter.getCompanyName(),
                    coverLetter.getJobPosition(),
                    String.format("%d년 %s",
                            coverLetter.getApplyYear(),
                            coverLetter.getApplyHalf().getDescription()),
                    qnA.getQuestion(),
                    qnA.getAnswer(),
                    coverLetter.getId(),
                    qnA.getQuestionCategory()
            );
        }
    }

    public static SearchLibraryAndQnAResponse of(List<QuestionCategoryType> libraries, Long qnACount, List<QnA> qnaItems, boolean hasNext) {
        return new SearchLibraryAndQnAResponse(
                libraries.size(),
                libraries.stream()
                        .map(QuestionCategoryType::getDescription)
                        .toList(),
                qnACount,
                qnaItems.stream()
                        .map(QnAItem::from)
                        .toList(),
                hasNext
        );
    }
}
