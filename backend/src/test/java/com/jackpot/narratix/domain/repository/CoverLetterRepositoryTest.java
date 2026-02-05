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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

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
        CoverLetter coverLetter = builder()
                .userId(user.getId())
                .qnaFixtures(
                        List.of(
                                new QnAFixture(question1, QuestionCategoryType.MOTIVATION),
                                new QnAFixture(question2, QuestionCategoryType.TEAMWORK_EXPERIENCE),
                                new QnAFixture(question3, QuestionCategoryType.PERSONALITY)
                        )
                ).build();

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
        CoverLetter coverLetter = builder()
                .userId(user.getId())
                .qnaFixtures(
                        List.of(
                                new QnAFixture(question1, QuestionCategoryType.MOTIVATION),
                                new QnAFixture(question2, QuestionCategoryType.TEAMWORK_EXPERIENCE)
                        )
                ).build();

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
    void findInPeriod_WithinDateRange() {
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
        List<CoverLetter> result = coverLetterJpaRepository.findByUserIdAndDeadlineBetweenOrderByDeadlineAscModifiedAtDesc(
                userId, startDate, endDate, pageable
        );

        // then
        assertThat(result).hasSize(3);
        assertThat(result)
                .extracting(CoverLetter::getDeadline)
                .containsExactly(
                        LocalDate.of(2024, 6, 15),
                        LocalDate.of(2024, 8, 20),
                        LocalDate.of(2024, 12, 31)
                );
    }

    @Test
    @DisplayName("하루의 날짜 범위로 자기소개서 조회 시 그 날의 자기소개서만 조회된다")
    void findInPeriod_WithOneDateRange() {
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
        List<CoverLetter> result = coverLetterJpaRepository.findByUserIdAndDeadlineBetweenOrderByDeadlineAscModifiedAtDesc(
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
    @DisplayName("날짜 범위로 자기소개서 조회 시 deadline 오름차순, 같은 deadline 내에서는 modifiedAt 내림차순으로 정렬된다")
    void findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc_OrderedByDeadlineAscAndModifiedAtDesc() {
        // given
        User user = saveUser("testUser101", "테스터4");
        String userId = user.getId();

        LocalDate sameDeadline = LocalDate.of(2024, 6, 15);
        LocalDateTime olderTime = LocalDateTime.of(2024, 6, 10, 10, 0);
        LocalDateTime newerTime = LocalDateTime.of(2024, 6, 10, 12, 0);

        // 같은 deadline을 가진 자기소개서 2개 (modifiedAt 다르게 설정)
        CoverLetter coverLetter1 = new CoverLetterFixtureBuilder()
                .userId(userId)
                .deadline(sameDeadline)
                .modifiedAt(olderTime)
                .build();
        CoverLetter coverLetter2 = new CoverLetterFixtureBuilder()
                .userId(userId)
                .deadline(sameDeadline)
                .modifiedAt(newerTime)
                .build();

        // 다른 deadline을 가진 자기소개서
        CoverLetter coverLetter3 = createCoverLetterWithDeadline(userId, LocalDate.of(2024, 8, 20));

        coverLetterJpaRepository.save(coverLetter1);
        coverLetterJpaRepository.save(coverLetter2);
        coverLetterJpaRepository.save(coverLetter3);
        flushAndClear();

        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Pageable pageable = PageRequest.of(0, 10);

        // when
        List<CoverLetter> result = coverLetterJpaRepository.findByUserIdAndDeadlineBetweenOrderByDeadlineAscModifiedAtDesc(
                userId, startDate, endDate, pageable
        );

        // then
        assertThat(result).hasSize(3);

        // deadline 오름차순 검증
        assertThat(result.get(0).getDeadline()).isEqualTo(sameDeadline);
        assertThat(result.get(1).getDeadline()).isEqualTo(sameDeadline);
        assertThat(result.get(2).getDeadline()).isEqualTo(LocalDate.of(2024, 8, 20));

        // 같은 deadline 내에서 modifiedAt 내림차순 검증 (최신 수정된 것이 먼저)
        assertThat(result.get(0).getModifiedAt()).isEqualTo(newerTime);
        assertThat(result.get(1).getModifiedAt()).isEqualTo(olderTime);
    }

    @Test
    @DisplayName("날짜 범위로 자기소개서 조회 시 Pageable의 size에 따라 결과 개수가 제한된다")
    void findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc_LimitedByDeadlineAscAndPageableSize() {
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
        List<CoverLetter> result = coverLetterJpaRepository.findByUserIdAndDeadlineBetweenOrderByDeadlineAscModifiedAtDesc(
                userId, startDate, endDate, pageable
        );

        // then
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("날짜 범위로 자기소개서 조회 시 다른 사용자의 자기소개서는 조회되지 않는다")
    void findByUserIdAndDeadlineBetweenOrderByModifiedAtDesc_FiltersByUserIdDeadlineAscAnd() {
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
        List<CoverLetter> resultUser1 = coverLetterJpaRepository.findByUserIdAndDeadlineBetweenOrderByDeadlineAscModifiedAtDesc(
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
        Long count = coverLetterJpaRepository.countByUserIdAndDeadlineBetween(userId, startDate, endDate);

        // then
        assertThat(count).isEqualTo(3);
    }

    @Test
    @DisplayName("날짜 범위로 자기소개서 개수 조회 시 다른 사용자의 자기소개서는 카운트되지 않는다")
    void countByUserIdAndDeadlineBetween_FiltersByUserId() {
        // given
        User user1 = saveUser("testUser606", "테스터9");
        User user2 = saveUser("testUser707", "테스터10");


        CoverLetter user1CoverLetter1 = createCoverLetterWithDeadline(user1.getId(), LocalDate.of(2024, 6, 15));
        CoverLetter user1CoverLetterUser2 = createCoverLetterWithDeadline(user1.getId(), LocalDate.of(2024, 8, 20));
        CoverLetter user2CoverLetter = createCoverLetterWithDeadline(user2.getId(), LocalDate.of(2024, 9, 10));

        coverLetterJpaRepository.save(user1CoverLetter1);
        coverLetterJpaRepository.save(user1CoverLetterUser2);
        coverLetterJpaRepository.save(user2CoverLetter);
        flushAndClear();

        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        // when
        Long countUser1 = coverLetterJpaRepository.countByUserIdAndDeadlineBetween(user1.getId(), startDate, endDate);

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
        Long count = coverLetterJpaRepository.countByUserIdAndDeadlineBetween(userId, startDate, endDate);

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

        CoverLetter cl1 = new CoverLetterFixtureBuilder()
                .userId(userId)
                .deadline(deadline1)
                .modifiedAt(oldestModifiedAt1)
                .build();
        CoverLetter cl2 = new CoverLetterFixtureBuilder()
                .userId(userId)
                .deadline(deadline1)
                .modifiedAt(middleModifiedAt1)
                .build();
        CoverLetter cl3 = new CoverLetterFixtureBuilder()
                .userId(userId)
                .deadline(deadline1)
                .modifiedAt(mostRecentModifiedAt1)
                .build();

        // deadline 2: 2024-06-20 (2개 자기소개서)
        LocalDate deadline2 = LocalDate.of(2024, 6, 20);
        LocalDateTime oldestModifiedAt2 = LocalDateTime.of(2024, 6, 15, 10, 0);
        LocalDateTime mostRecentModifiedAt2 = LocalDateTime.of(2024, 6, 15, 12, 0);

        CoverLetter cl4 = builder()
                .userId(userId)
                .deadline(deadline2)
                .modifiedAt(oldestModifiedAt2)
                .build();
        CoverLetter cl5 = builder()
                .userId(userId)
                .deadline(deadline2)
                .modifiedAt(mostRecentModifiedAt2)
                .build();

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

    @Test
    @DisplayName("유저 ID로 기업명 목록을 조회하면 중복이 제거된 리스트가 반환된다")
    void findDistinctCompanyNamesByUserId() {
        // given
        User user = saveUser("user1", "유저1");
        User otherUser = saveUser("user2", "유저2");

        saveCoverLetterWithTime(user.getId(), "Samsung", LocalDateTime.now());
        saveCoverLetterWithTime(user.getId(), "Samsung", LocalDateTime.now());
        saveCoverLetterWithTime(user.getId(), "LG", LocalDateTime.now());

        saveCoverLetterWithTime(otherUser.getId(), "Naver", LocalDateTime.now());

        flushAndClear();

        // when
        List<String> companyNames = coverLetterJpaRepository.findDistinctCompanyNamesByUserId(user.getId());

        // then
        assertThat(companyNames).hasSize(2)
                .containsExactlyInAnyOrder("Samsung", "LG");
    }

    @Test
    @DisplayName("기업별 자소서 조회 (첫 페이지) - modifiedAt 내림차순으로 정렬되어야 한다")
    void findFirstPageByCompany() {
        // given
        String userId = "user1";
        String companyName = "Samsung";

        CoverLetter old = saveCoverLetterWithTime(userId, companyName, LocalDateTime.now().minusDays(3));
        CoverLetter middle = saveCoverLetterWithTime(userId, companyName, LocalDateTime.now().minusDays(2));
        CoverLetter latest = saveCoverLetterWithTime(userId, companyName, LocalDateTime.now().minusDays(1));

        flushAndClear();

        // when
        Slice<CoverLetter> result = coverLetterJpaRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                userId, companyName, PageRequest.of(0, 2)
        );

        // then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.hasNext()).isTrue();

        assertThat(result.getContent().get(0).getId()).isEqualTo(latest.getId());
        assertThat(result.getContent().get(1).getId()).isEqualTo(middle.getId());
    }

    @Test
    @DisplayName("기업별 자소서 조회 (다음 페이지)")
    void findNextPageByCompany() {
        // given
        String userId = "user1";
        String companyName = "Samsung";

        CoverLetter old = saveCoverLetterWithTime(userId, companyName, LocalDateTime.now().minusDays(3));
        CoverLetter middle = saveCoverLetterWithTime(userId, companyName, LocalDateTime.now().minusDays(2));
        CoverLetter latest = saveCoverLetterWithTime(userId, companyName, LocalDateTime.now().minusDays(1));

        flushAndClear();

        // when
        Slice<CoverLetter> result = coverLetterJpaRepository.findNextPageByCompany(
                userId,
                companyName,
                LocalDateTime.from(latest.getModifiedAt()),
                PageRequest.of(0, 2)
        );

        // then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getId()).isEqualTo(middle.getId());
        assertThat(result.getContent().get(1).getId()).isEqualTo(old.getId());
        assertThat(result.hasNext()).isFalse();
    }


    private CoverLetter saveCoverLetterWithTime(String userId, String companyName, LocalDateTime modifiedAt) {
        CoverLetter coverLetter = new CoverLetterFixtureBuilder()
                .userId(userId)
                .companyName(companyName)
                .modifiedAt(modifiedAt)
                .build();

        return coverLetterJpaRepository.save(coverLetter);
    }
}