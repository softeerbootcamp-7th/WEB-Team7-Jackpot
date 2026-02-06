package com.jackpot.narratix.domain.entity;

import com.jackpot.narratix.domain.controller.request.CreateQuestionRequest;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.fixture.CoverLetterFixture.CoverLetterFixtureBuilder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class QnATest {

    @Test
    @DisplayName("editAnswer 호출 시 동일한 답변이어도 modifiedAt이 업데이트된다")
    void editAnswer_SameValue_UpdatesModifiedAt() {
        // given
        CoverLetter coverLetter = new CoverLetterFixtureBuilder().build();

        CreateQuestionRequest questionRequest = new CreateQuestionRequest(
                "지원 동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );
        QnA qnA = QnA.newQnA(coverLetter, questionRequest);

        // 초기 답변 설정
        String initialAnswer = "저는 귀사의 비전에 공감합니다.";
        qnA.editAnswer(initialAnswer);

        // modifiedAt을 과거 시간으로 설정
        LocalDateTime pastTime = LocalDateTime.now().minusHours(1);
        ReflectionTestUtils.setField(qnA, "modifiedAt", pastTime);

        // when - 동일한 답변으로 다시 수정
        qnA.editAnswer(initialAnswer);

        // then - modifiedAt이 업데이트되어야 함
        assertThat(qnA.getModifiedAt()).isAfter(pastTime);
        assertThat(qnA.getAnswer()).isEqualTo(initialAnswer);
    }

    @Test
    @DisplayName("editAnswer 호출 시 다른 답변으로 변경하면 modifiedAt이 업데이트된다")
    void editAnswer_DifferentValue_UpdatesModifiedAt() {
        // given
        CoverLetter coverLetter = new CoverLetterFixtureBuilder().build();
        CreateQuestionRequest questionRequest = new CreateQuestionRequest(
                "지원 동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );
        QnA qnA = QnA.newQnA(coverLetter, questionRequest);

        String initialAnswer = "저는 귀사의 비전에 공감합니다.";
        qnA.editAnswer(initialAnswer);

        // modifiedAt을 과거 시간으로 설정
        LocalDateTime pastTime = LocalDateTime.now().minusHours(1);
        ReflectionTestUtils.setField(qnA, "modifiedAt", pastTime);

        // when - 다른 답변으로 수정
        String newAnswer = "저는 귀사의 기술력에 감명받았습니다.";
        qnA.editAnswer(newAnswer);

        // then
        assertThat(qnA.getModifiedAt()).isAfter(pastTime);
        assertThat(qnA.getAnswer()).isEqualTo(newAnswer);
    }
}
