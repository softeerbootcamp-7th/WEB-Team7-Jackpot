package com.jackpot.narratix.domain.fixture;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import org.springframework.test.util.ReflectionTestUtils;

import static com.jackpot.narratix.domain.fixture.BaseTimeEntityFixture.setAuditFields;

public class QnAFixture {

    public static QnA createQnA(
            CoverLetter coverLetter, String userId, String question, QuestionCategoryType category
    ) {
        QnA qna = new QnA();
        ReflectionTestUtils.setField(qna, "coverLetter", coverLetter);
        ReflectionTestUtils.setField(qna, "userId", userId);
        ReflectionTestUtils.setField(qna, "question", question);
        ReflectionTestUtils.setField(qna, "questionCategory", category);
        setAuditFields(qna);
        return qna;
    }
}
