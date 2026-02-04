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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    @Test
    @DisplayName("날짜 범위로 자기소개서 조회 시 해당 범위 내의 자기소개서만 조회된다")
    void findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc_WithinDateRange() {
        // given
        User user = saveUser("testUser789", "테스터3");
        String userId = user.getId();

        CoverLetter coverLetter1 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 6, 15));
        CoverLetter coverLetter2 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 8, 20));
        CoverLetter coverLetter3 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 12, 31));
        CoverLetter coverLetterOutOfRange = createCoverLetterWithDeadline(userId, LocalDate.of(2025, 1, 15));

        coverLetterJpaRepository.save(coverLetter1);
        coverLetterJpaRepository.save(coverLetter2);
        coverLetterJpaRepository.save(coverLetter3);
        coverLetterJpaRepository.save(coverLetterOutOfRange);
        flushAndClear();

        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Pageable pageable = PageRequest.of(0, 10);

        // when
        List<CoverLetter> result = coverLetterJpaRepository.findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc(
                userId, startDate, endDate, pageable
        );

        // then
        assertThat(result).hasSize(3);
        assertThat(result)
                .extracting(CoverLetter::getDeadline)
                .containsExactly(
                        LocalDate.of(2024, 12, 31),
                        LocalDate.of(2024, 8, 20),
                        LocalDate.of(2024, 6, 15)
                );
    }

    @Test
    @DisplayName("하루의 날짜 범위로 자기소개서 조회 시 그 날의 자기소개서만 조회된다")
    void findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc_WithOneDateRange() {
        // given
        User user = saveUser("testUser789", "테스터3");
        String userId = user.getId();

        LocalDate targetDate = LocalDate.of(2026, 2, 4);

        CoverLetter coverLetter1 = createCoverLetterWithDeadline(userId, targetDate);
        CoverLetter coverLetter2 = createCoverLetterWithDeadline(userId, targetDate);
        CoverLetter coverLetterOutOfRange1 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 12, 31));
        CoverLetter coverLetterOutOfRange2 = createCoverLetterWithDeadline(userId, LocalDate.of(2025, 1, 15));

        coverLetterJpaRepository.save(coverLetter1);
        coverLetterJpaRepository.save(coverLetter2);
        coverLetterJpaRepository.save(coverLetterOutOfRange1);
        coverLetterJpaRepository.save(coverLetterOutOfRange2);
        flushAndClear();

        Pageable pageable = PageRequest.of(0, 10);

        // when
        List<CoverLetter> result = coverLetterJpaRepository.findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc(
                userId, targetDate, targetDate, pageable
        );

        // then
        assertThat(result).hasSize(2);
        assertThat(result)
                .extracting(CoverLetter::getDeadline)
                .containsExactly(
                        targetDate,
                        targetDate
                );
    }

    @Test
    @DisplayName("날짜 범위로 자기소개서 조회 시 수정일(modifiedAt) 기준 내림차순으로 정렬된다")
    void findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc_OrderedByModifiedAtDesc() {
        // given
        User user = saveUser("testUser101", "테스터4");
        String userId = user.getId();

        CoverLetter coverLetter1 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 6, 15));
        CoverLetter coverLetter2 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 8, 20));
        CoverLetter coverLetter3 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 12, 31));

        coverLetterJpaRepository.save(coverLetter1);
        coverLetterJpaRepository.save(coverLetter2);
        coverLetterJpaRepository.save(coverLetter3);
        flushAndClear();

        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Pageable pageable = PageRequest.of(0, 10);

        // when
        List<CoverLetter> result = coverLetterJpaRepository.findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc(
                userId, startDate, endDate, pageable
        );

        // then
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getModifiedAt()).isAfterOrEqualTo(result.get(1).getModifiedAt());
        assertThat(result.get(1).getModifiedAt()).isAfterOrEqualTo(result.get(2).getModifiedAt());
    }

    @Test
    @DisplayName("날짜 범위로 자기소개서 조회 시 Pageable의 size에 따라 결과 개수가 제한된다")
    void findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc_LimitedByPageableSize() {
        // given
        User user = saveUser("testUser202", "테스터5");
        String userId = user.getId();

        for (int i = 1; i <= 5; i++) {
            CoverLetter coverLetter = createCoverLetterWithDeadline(userId, LocalDate.of(2024, i, 1));
            coverLetterJpaRepository.save(coverLetter);
        }
        flushAndClear();

        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Pageable pageable = PageRequest.of(0, 3);

        // when
        List<CoverLetter> result = coverLetterJpaRepository.findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc(
                userId, startDate, endDate, pageable
        );

        // then
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("날짜 범위로 자기소개서 조회 시 다른 사용자의 자기소개서는 조회되지 않는다")
    void findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc_FiltersByUserId() {
        // given
        User user1 = saveUser("testUser303", "테스터6");
        User user2 = saveUser("testUser404", "테스터7");

        CoverLetter coverLetterUser1 = createCoverLetterWithDeadline(user1.getId(), LocalDate.of(2024, 6, 15));
        CoverLetter coverLetterUser2 = createCoverLetterWithDeadline(user2.getId(), LocalDate.of(2024, 8, 20));

        coverLetterJpaRepository.save(coverLetterUser1);
        coverLetterJpaRepository.save(coverLetterUser2);
        flushAndClear();

        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Pageable pageable = PageRequest.of(0, 10);

        // when
        List<CoverLetter> resultUser1 = coverLetterJpaRepository.findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc(
                user1.getId(), startDate, endDate, pageable
        );

        // then
        assertThat(resultUser1).hasSize(1);
        assertThat(resultUser1.get(0).getUserId()).isEqualTo(user1.getId());
    }

    @Test
    @DisplayName("날짜 범위로 자기소개서 개수 조회 시 해당 범위 내의 자기소개서 개수만 반환된다")
    void countByUserIdAndDeadlineBetween_WithinDateRange() {
        // given
        User user = saveUser("testUser505", "테스터8");
        String userId = user.getId();

        CoverLetter coverLetter1 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 6, 15));
        CoverLetter coverLetter2 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 8, 20));
        CoverLetter coverLetter3 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 12, 31));
        CoverLetter coverLetterOutOfRange = createCoverLetterWithDeadline(userId, LocalDate.of(2025, 1, 15));

        coverLetterJpaRepository.save(coverLetter1);
        coverLetterJpaRepository.save(coverLetter2);
        coverLetterJpaRepository.save(coverLetter3);
        coverLetterJpaRepository.save(coverLetterOutOfRange);
        flushAndClear();

        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        // when
        Integer count = coverLetterJpaRepository.countByUserIdAndDeadlineBetween(userId, startDate, endDate);

        // then
        assertThat(count).isEqualTo(3);
    }

    @Test
    @DisplayName("날짜 범위로 자기소개서 개수 조회 시 다른 사용자의 자기소개서는 카운트되지 않는다")
    void countByUserIdAndDeadlineBetween_FiltersByUserId() {
        // given
        User user1 = saveUser("testUser606", "테스터9");
        User user2 = saveUser("testUser707", "테스터10");

        CoverLetter coverLetterUser1_1 = createCoverLetterWithDeadline(user1.getId(), LocalDate.of(2024, 6, 15));
        CoverLetter coverLetterUser1_2 = createCoverLetterWithDeadline(user1.getId(), LocalDate.of(2024, 8, 20));
        CoverLetter coverLetterUser2 = createCoverLetterWithDeadline(user2.getId(), LocalDate.of(2024, 9, 10));

        coverLetterJpaRepository.save(coverLetterUser1_1);
        coverLetterJpaRepository.save(coverLetterUser1_2);
        coverLetterJpaRepository.save(coverLetterUser2);
        flushAndClear();

        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        // when
        Integer countUser1 = coverLetterJpaRepository.countByUserIdAndDeadlineBetween(user1.getId(), startDate, endDate);

        // then
        assertThat(countUser1).isEqualTo(2);
    }

    @Test
    @DisplayName("날짜 범위로 자기소개서 개수 조회 시 범위 내 자기소개서가 없으면 0을 반환한다")
    void countByUserIdAndDeadlineBetween_ReturnsZeroWhenNoResults() {
        // given
        User user = saveUser("testUser808", "테스터11");
        String userId = user.getId();

        CoverLetter coverLetter = createCoverLetterWithDeadline(userId, LocalDate.of(2025, 1, 15));
        coverLetterJpaRepository.save(coverLetter);
        flushAndClear();

        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        // when
        Integer count = coverLetterJpaRepository.countByUserIdAndDeadlineBetween(userId, startDate, endDate);

        // then
        assertThat(count).isZero();
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

    private CoverLetter createCoverLetterWithDeadline(String userId, LocalDate deadline) {
        CoverLetter coverLetter = new CoverLetter();
        ReflectionTestUtils.setField(coverLetter, "userId", userId);
        ReflectionTestUtils.setField(coverLetter, "companyName", "테스트기업");
        ReflectionTestUtils.setField(coverLetter, "applyYear", deadline.getYear());
        ReflectionTestUtils.setField(coverLetter, "applyHalf", ApplyHalfType.FIRST_HALF);
        ReflectionTestUtils.setField(coverLetter, "jobPosition", "백엔드 개발자");
        ReflectionTestUtils.setField(coverLetter, "deadline", deadline);
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