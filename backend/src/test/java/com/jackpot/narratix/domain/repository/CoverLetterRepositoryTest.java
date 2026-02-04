package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class CoverLetterRepositoryTest {

    @Autowired
    private CoverLetterJpaRepository coverLetterJpaRepository;

    @Autowired
    private QnAJpaRepository qnAJpaRepository;

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    @DisplayName("CoverLetter 저장 시 연관관계로 설정된 QnA도 cascade로 저장된다")
    void saveCoverLetterWithQnAs() {
        // given
        final String question1 = "지원 동기는 무엇인가요?";
        final String question2 = "팀워크 경험을 설명해주세요.";
        final String question3 = "프로젝트 경험을 설명해주세요.";

        User user = saveUser("testUser123", "테스터");
        CoverLetter coverLetter = createCoverLetterWithQnAs(
                user.getId(),
                List.of(
                        new QnAFixture(question1, QuestionCategoryType.MOTIVATION),
                        new QnAFixture(question2, QuestionCategoryType.TEAMWORK_EXPERIENCE),
                        new QnAFixture(question3, QuestionCategoryType.PERSONALITY)
                )
        );

        // when
        CoverLetter savedCoverLetter = coverLetterJpaRepository.save(coverLetter);
        flushAndClear();

        // then
        Optional<CoverLetter> foundCoverLetter = coverLetterJpaRepository.findById(savedCoverLetter.getId());
        assertThat(foundCoverLetter).isPresent();
        assertThat(foundCoverLetter.get().getQnAs()).hasSize(3);
        assertThat(foundCoverLetter.get().getQnAs())
                .extracting(QnA::getQuestion)
                .containsExactlyInAnyOrder(question1, question2, question3);
        assertThat(foundCoverLetter.get().getQnAs())
                .extracting(QnA::getQuestionCategory)
                .containsExactlyInAnyOrder(
                        QuestionCategoryType.MOTIVATION,
                        QuestionCategoryType.TEAMWORK_EXPERIENCE,
                        QuestionCategoryType.PERSONALITY
                );
    }

    @Test
    @DisplayName("CoverLetter 삭제 시 연관관계로 설정된 QnA도 함께 삭제된다")
    void deleteCoverLetterCascadesToQnAs() {
        // given
        final String question1 = "지원 동기는 무엇인가요?";
        final String question2 = "팀워크 경험을 설명해주세요.";
        User user = saveUser("testUser456", "테스터2");
        CoverLetter coverLetter = createCoverLetterWithQnAs(
                user.getId(),
                List.of(
                        new QnAFixture(question1, QuestionCategoryType.MOTIVATION),
                        new QnAFixture(question2, QuestionCategoryType.TEAMWORK_EXPERIENCE)
                )
        );

        CoverLetter savedCoverLetter = coverLetterJpaRepository.save(coverLetter);
        flushAndClear();

        Long coverLetterId = savedCoverLetter.getId();

        // when
        coverLetterJpaRepository.deleteById(coverLetterId);
        flushAndClear();

        // then
        Optional<CoverLetter> foundCoverLetter = coverLetterJpaRepository.findById(coverLetterId);
        assertThat(foundCoverLetter).isEmpty();

        long qnaCount = qnAJpaRepository.count();
        assertThat(qnaCount).isZero();
    }

    private User saveUser(String userId, String nickname) {
        User user = User.builder()
                .id(userId)
                .nickname(nickname)
                .build();
        setAuditFields(user);
        return userJpaRepository.save(user);
    }

    private CoverLetter createCoverLetterWithQnAs(String userId, List<QnAFixture> qnaFixtures) {
        CoverLetter coverLetter = createCoverLetter(userId);

        for (QnAFixture fixture : qnaFixtures) {
            QnA qna = createQnA(coverLetter, userId, fixture.question, fixture.category);
            coverLetter.getQnAs().add(qna);
        }

        return coverLetter;
    }

    private CoverLetter createCoverLetter(String userId) {
        CoverLetter coverLetter = new CoverLetter();
        ReflectionTestUtils.setField(coverLetter, "userId", userId);
        ReflectionTestUtils.setField(coverLetter, "companyName", "테스트기업");
        ReflectionTestUtils.setField(coverLetter, "applyYear", 2024);
        ReflectionTestUtils.setField(coverLetter, "applyHalf", ApplyHalfType.FIRST_HALF);
        ReflectionTestUtils.setField(coverLetter, "jobPosition", "백엔드 개발자");
        ReflectionTestUtils.setField(coverLetter, "deadline", LocalDate.of(2024, 12, 31));
        setAuditFields(coverLetter);
        return coverLetter;
    }

    private QnA createQnA(CoverLetter coverLetter, String userId, String question, QuestionCategoryType category) {
        QnA qna = new QnA();
        ReflectionTestUtils.setField(qna, "coverLetter", coverLetter);
        ReflectionTestUtils.setField(qna, "userId", userId);
        ReflectionTestUtils.setField(qna, "question", question);
        ReflectionTestUtils.setField(qna, "questionCategory", category);
        setAuditFields(qna);
        return qna;
    }

    private void setAuditFields(Object entity) {
        LocalDateTime now = LocalDateTime.now();
        ReflectionTestUtils.setField(entity, "createdAt", now);
        ReflectionTestUtils.setField(entity, "modifiedAt", now);
    }

    private void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }

    private record QnAFixture(String question, QuestionCategoryType category) {
    }
}