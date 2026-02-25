package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.exception.OptimisticLockException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import static com.jackpot.narratix.domain.fixture.BaseTimeEntityFixture.setAuditFields;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@Import(QnARepositoryImpl.class)
@ActiveProfiles("test")
@DisplayName("QnA 낙관적 락 테스트")
class QnARepositoryOptimisticLockTest {

    @Autowired
    private QnARepository qnARepository;

    @Autowired
    private QnAJpaRepository qnAJpaRepository;

    @Autowired
    private CoverLetterJpaRepository coverLetterJpaRepository;

    @Test
    @DisplayName("버전이 일치하면 업데이트 성공")
    void incrementVersionWithOptimisticLock_success() {
        // given: QnA 생성 (version = 0)
        QnA qnA = createAndSaveQnA();
        Long expectedVersion = 0L;

        // when: 버전 체크하며 증가
        long newVersion = qnARepository.incrementVersionWithOptimisticLock(
                qnA.getId(), 3, expectedVersion
        );

        // then: 버전이 3 증가
        assertThat(newVersion).isEqualTo(3L);
    }

    @Test
    @DisplayName("버전이 불일치하면 OPTIMISTIC_LOCK_FAILURE 예외 발생")
    void incrementVersionWithOptimisticLock_versionMismatch_throwsException() {
        // given: QnA 생성 (version = 0)
        QnA qnA = createAndSaveQnA();

        // 다른 트랜잭션이 먼저 버전을 증가시킴
        qnAJpaRepository.incrementVersion(qnA.getId(), 2); // version: 0 → 2

        // when & then: 예상 버전이 0이지만 실제는 2 → 예외 발생
        Long expectedVersion = 0L;
        assertThatThrownBy(() ->
                qnARepository.incrementVersionWithOptimisticLock(qnA.getId(), 3, expectedVersion)
        )
                .isInstanceOf(OptimisticLockException.class);
    }

    @Test
    @DisplayName("동시 업데이트 시 첫 번째만 성공하고 두 번째는 실패")
    void incrementVersionWithOptimisticLock_concurrent_onlyFirstSucceeds() {
        // given: QnA 생성 (version = 0)
        QnA qnA = createAndSaveQnA();
        Long expectedVersion = 0L;

        // when: 첫 번째 업데이트 성공
        long newVersion1 = qnARepository.incrementVersionWithOptimisticLock(
                qnA.getId(), 3, expectedVersion
        );

        // then: 버전이 3으로 증가
        assertThat(newVersion1).isEqualTo(3L);

        // when & then: 두 번째 업데이트는 실패 (version이 이미 3으로 변경됨)
        assertThatThrownBy(() ->
                qnARepository.incrementVersionWithOptimisticLock(qnA.getId(), 2, expectedVersion)
        )
                .isInstanceOf(OptimisticLockException.class);
    }

    @Test
    @DisplayName("올바른 버전으로 재시도하면 성공")
    void incrementVersionWithOptimisticLock_retryWithCorrectVersion_success() {
        // given: QnA 생성 (version = 0)
        QnA qnA = createAndSaveQnA();

        // 첫 번째 업데이트 성공 (version: 0 → 3)
        long newVersion1 = qnARepository.incrementVersionWithOptimisticLock(
                qnA.getId(), 3, 0L
        );
        assertThat(newVersion1).isEqualTo(3L);

        // when: 올바른 버전(3)으로 재시도
        long newVersion2 = qnARepository.incrementVersionWithOptimisticLock(
                qnA.getId(), 2, 3L
        );

        // then: 성공 (version: 3 → 5)
        assertThat(newVersion2).isEqualTo(5L);
    }

    @Test
    @DisplayName("delta가 0이어도 버전 체크는 수행됨")
    void incrementVersionWithOptimisticLock_zeroDelta_versionCheckPerformed() {
        // given: QnA 생성 (version = 0)
        QnA qnA = createAndSaveQnA();

        // 다른 트랜잭션이 먼저 버전을 증가시킴
        qnAJpaRepository.incrementVersion(qnA.getId(), 5); // version: 0 → 5

        // when & then: delta가 0이어도 버전 불일치면 예외 발생
        assertThatThrownBy(() ->
                qnARepository.incrementVersionWithOptimisticLock(qnA.getId(), 0, 0L)
        )
                .isInstanceOf(OptimisticLockException.class);
    }

    private QnA createAndSaveQnA() {
        CoverLetter coverLetter = CoverLetter.builder()
                .userId("test-user")
                .companyName("Test Company")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .jobPosition("백엔드 개발자")
                .deadline(java.time.LocalDate.now().plusDays(30))
                .build();
        setAuditFields(coverLetter);
        coverLetterJpaRepository.save(coverLetter);

        QnA qnA = QnA.builder()
                .coverLetter(coverLetter)
                .userId("test-user")
                .questionCategory(QuestionCategoryType.MOTIVATION)
                .question("Test Question")
                .answer("ABC")
                .version(0L)
                .build();
        setAuditFields(qnA);
        return qnAJpaRepository.save(qnA);
    }
}