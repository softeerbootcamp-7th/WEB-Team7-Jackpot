package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.jackpot.narratix.domain.fixture.BaseTimeEntityFixture.setAuditFields;
import static com.jackpot.narratix.domain.fixture.CoverLetterFixture.*;
import static org.assertj.core.api.Assertions.assertThat;

import org.springframework.context.annotation.Import;

@DataJpaTest
@Import(CoverLetterRepositoryImpl.class)
class CoverLetterRepositoryTest {

    @Autowired
    private CoverLetterJpaRepository coverLetterJpaRepository;

    @Autowired
    private CoverLetterRepository coverLetterRepository;

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

    private void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("다가오는 자기소개서 조회 시 최대 마감일 그룹 제한을 만족하여 반환한다.")
    void findUpcomingCoverLettersGroupedByDeadline_GroupedAndLimited() {
        // given
        User user = saveUser("testUser909", "테스터12");
        String userId = user.getId();
        LocalDate queryDate = LocalDate.of(2024, 6, 1);

        // deadline 1: 2024-06-15 (3개 자기소개서)
        LocalDate deadline1 = LocalDate.of(2024, 6, 15);
        LocalDateTime oldestModifiedAt1 = LocalDateTime.of(2024, 6, 10, 10, 0); // 가장 오래됨
        LocalDateTime middleModifiedAt1 = LocalDateTime.of(2024, 6, 10, 12, 0); // 중간
        LocalDateTime mostRecentModifiedAt1 = LocalDateTime.of(2024, 6, 10, 14, 0); // 가장 최신

        CoverLetter cl1 = createCoverLetterWithDeadlineAndModifiedAt(userId, deadline1, oldestModifiedAt1);
        CoverLetter cl2 = createCoverLetterWithDeadlineAndModifiedAt(userId, deadline1, middleModifiedAt1);
        CoverLetter cl3 = createCoverLetterWithDeadlineAndModifiedAt(userId, deadline1, mostRecentModifiedAt1);

        // deadline 2: 2024-06-20 (2개 자기소개서)
        LocalDate deadline2 = LocalDate.of(2024, 6, 20);
        LocalDateTime oldestModifiedAt2 = LocalDateTime.of(2024, 6, 15, 10, 0);
        LocalDateTime mostRecentModifiedAt2 = LocalDateTime.of(2024, 6, 15, 12, 0);

        CoverLetter cl4 = createCoverLetterWithDeadlineAndModifiedAt(userId, deadline2, oldestModifiedAt2);
        CoverLetter cl5 = createCoverLetterWithDeadlineAndModifiedAt(userId, deadline2, mostRecentModifiedAt2);

        // deadline 3: 2024-06-25 (1개 자기소개서)
        LocalDate deadline3 = LocalDate.of(2024, 6, 25);
        CoverLetter cl6 = createCoverLetterWithDeadline(userId, deadline3);

        LocalDate deadline4 = LocalDate.of(2024, 6, 30);
        CoverLetter cl7 = createCoverLetterWithDeadline(userId, deadline4);

        coverLetterJpaRepository.save(cl1);
        coverLetterJpaRepository.save(cl2);
        coverLetterJpaRepository.save(cl3);
        coverLetterJpaRepository.save(cl4);
        coverLetterJpaRepository.save(cl5);
        coverLetterJpaRepository.save(cl6);
        coverLetterJpaRepository.save(cl7);
        flushAndClear();

        int maxDeadLineSize = 3;
        int maxCoverLetterSizePerDeadLine = 2;

        // when
        Map<LocalDate, List<CoverLetter>> result = coverLetterRepository.findUpcomingCoverLettersGroupedByDeadline(
                userId, queryDate, maxDeadLineSize, maxCoverLetterSizePerDeadLine
        );

        // then
        assertThat(result).hasSize(maxDeadLineSize); // 3개의 deadline 그룹

        // 첫 번째 그룹 (deadline1: 2024-06-15) - modifiedAt desc로 정렬된 최대 2개
        List<CoverLetter> group1 = result.get(deadline1);
        assertThat(group1).hasSize(2);
        assertThat(group1.get(0).getDeadline()).isEqualTo(deadline1);
        assertThat(group1.get(0).getModifiedAt()).isEqualTo(mostRecentModifiedAt1); // 가장 최신
        assertThat(group1.get(1).getModifiedAt()).isEqualTo(middleModifiedAt1); // 두 번째 최신

        // 두 번째 그룹 (deadline2: 2024-06-20)
        List<CoverLetter> group2 = result.get(deadline2);
        assertThat(group2).hasSize(2);
        assertThat(group2.get(0).getDeadline()).isEqualTo(deadline2);
        assertThat(group2.get(0).getModifiedAt()).isEqualTo(mostRecentModifiedAt2);
        assertThat(group2.get(1).getModifiedAt()).isEqualTo(oldestModifiedAt2);

        // 세 번째 그룹 (deadline3: 2024-06-25)
        List<CoverLetter> group3 = result.get(deadline3);
        assertThat(group3).hasSize(1);
        assertThat(group3.get(0).getDeadline()).isEqualTo(deadline3);
    }

    @Test
    @DisplayName("다가오는 자기소개서 조회시 5개 마감일 그룹이 있어도 최대 마감일 그룹 제한만큼만 반환")
    void findUpcomingCoverLettersGroupedByDeadline_MaxThreeDeadlines() {
        // given
        User user = saveUser("testUser1010", "테스터13");
        String userId = user.getId();
        LocalDate queryDate = LocalDate.of(2024, 6, 1);

        // 5개의 다른 deadline
        CoverLetter cl1 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 6, 15));
        CoverLetter cl2 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 6, 20));
        CoverLetter cl3 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 6, 25));
        CoverLetter cl4 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 7, 1));  // 4번째 - 포함 안됨
        CoverLetter cl5 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 7, 10)); // 5번째 - 포함 안됨

        coverLetterJpaRepository.save(cl1);
        coverLetterJpaRepository.save(cl2);
        coverLetterJpaRepository.save(cl3);
        coverLetterJpaRepository.save(cl4);
        coverLetterJpaRepository.save(cl5);
        flushAndClear();

        int maxDeadLineSize = 3;
        // when
        Map<LocalDate, List<CoverLetter>> result = coverLetterRepository.findUpcomingCoverLettersGroupedByDeadline(
                userId, queryDate, maxDeadLineSize, 2
        );

        // then
        assertThat(result).hasSize(maxDeadLineSize);
        assertThat(result.keySet()).containsExactly(
                LocalDate.of(2024, 6, 15),
                LocalDate.of(2024, 6, 20),
                LocalDate.of(2024, 6, 25)
        );
    }

    @Test
    @DisplayName("다가오는 자기소개서 조회 시 deadline이 queryDate보다 이전이면 조회되지 않음")
    void findUpcomingCoverLettersGroupedByDeadline_OnlyFutureDeadlines() {
        // given
        User user = saveUser("testUser1111", "테스터14");
        String userId = user.getId();
        LocalDate queryDate = LocalDate.of(2024, 6, 15);

        LocalDate pastDeadLine = LocalDate.of(2024, 6, 10);
        CoverLetter cl1 = createCoverLetterWithDeadline(userId, pastDeadLine);
        LocalDate sameDeadLine = LocalDate.of(2024, 6, 15);
        CoverLetter cl2 = createCoverLetterWithDeadline(userId, sameDeadLine);
        LocalDate futureDeadLine = LocalDate.of(2024, 6, 20);
        CoverLetter cl3 = createCoverLetterWithDeadline(userId, futureDeadLine);

        coverLetterJpaRepository.save(cl1);
        coverLetterJpaRepository.save(cl2);
        coverLetterJpaRepository.save(cl3);
        flushAndClear();

        // when
        Map<LocalDate, List<CoverLetter>> result = coverLetterRepository.findUpcomingCoverLettersGroupedByDeadline(
                userId, queryDate, 3, 2
        );

        // then
        assertThat(result).hasSize(2); // 과거 deadline은 제외
        assertThat(result.keySet()).containsExactly(sameDeadLine, futureDeadLine);
    }

    @Test
    @DisplayName("다가오는 자기소개서 조회 시 다른 사용자의 자기소개서는 조회되지 않음")
    void findUpcomingCoverLettersGroupedByDeadline_FilterByUserId() {
        // given
        User user1 = saveUser("testUser1212", "테스터15");
        User otherUser = saveUser("testUser1313", "테스터16");
        LocalDate queryDate = LocalDate.of(2024, 6, 1);
        LocalDate deadline = LocalDate.of(2024, 6, 15);

        CoverLetter cl1 = createCoverLetterWithDeadline(user1.getId(), deadline);
        CoverLetter cl2 = createCoverLetterWithDeadline(otherUser.getId(), deadline);

        coverLetterJpaRepository.save(cl1);
        coverLetterJpaRepository.save(cl2);
        flushAndClear();

        // when
        Map<LocalDate, List<CoverLetter>> result = coverLetterRepository.findUpcomingCoverLettersGroupedByDeadline(
                user1.getId(), queryDate, 3, 2
        );

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(deadline)).hasSize(1);
        assertThat(result.get(deadline).get(0).getUserId()).isEqualTo(user1.getId());
    }

    @Test
    @DisplayName("다가오는 자기소개서 조회 시 deadline이 없으면 빈 리스트 반환")
    void findUpcomingCoverLettersGroupedByDeadline_EmptyWhenNoUpcoming() {
        // given
        User user = saveUser("testUser1414", "테스터17");
        String userId = user.getId();
        LocalDate queryDate = LocalDate.of(2024, 6, 1);

        // when
        Map<LocalDate, List<CoverLetter>> result = coverLetterRepository.findUpcomingCoverLettersGroupedByDeadline(
                userId, queryDate, 3, 2
        );

        // then
        assertThat(result).isEmpty();
    }
}