package com.jackpot.narratix.domain.fixture;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static com.jackpot.narratix.domain.fixture.BaseTimeEntityFixture.setAuditFields;
import static com.jackpot.narratix.domain.fixture.QnAFixture.createQnA;

public class CoverLetterFixture {

    public record QnAFixture(String question, QuestionCategoryType category) {
    }

    public static CoverLetterFixtureBuilder builder() {
        return new CoverLetterFixtureBuilder();
    }

    public static class CoverLetterFixtureBuilder {
        private Long id;
        private String userId = "testUser";
        private String companyName = "테스트기업";
        private Integer applyYear = 2024;
        private ApplyHalfType applyHalf = ApplyHalfType.FIRST_HALF;
        private String jobPosition = "백엔드 개발자";
        private LocalDate deadline = LocalDate.of(2024, 12, 31);
        private LocalDateTime createdAt;
        private LocalDateTime modifiedAt;
        private List<QnAFixture> qnaFixtures;

        public CoverLetterFixtureBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CoverLetterFixtureBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public CoverLetterFixtureBuilder companyName(String companyName) {
            this.companyName = companyName;
            return this;
        }

        public CoverLetterFixtureBuilder applyYear(Integer applyYear) {
            this.applyYear = applyYear;
            return this;
        }

        public CoverLetterFixtureBuilder applyHalf(ApplyHalfType applyHalf) {
            this.applyHalf = applyHalf;
            return this;
        }

        public CoverLetterFixtureBuilder jobPosition(String jobPosition) {
            this.jobPosition = jobPosition;
            return this;
        }

        public CoverLetterFixtureBuilder deadline(LocalDate deadline) {
            this.deadline = deadline;
            if (deadline != null) {
                this.applyYear = deadline.getYear();
            }
            return this;
        }

        public CoverLetterFixtureBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public CoverLetterFixtureBuilder modifiedAt(LocalDateTime modifiedAt) {
            this.modifiedAt = modifiedAt;
            return this;
        }

        public CoverLetterFixtureBuilder qnaFixtures(List<QnAFixture> qnaFixtures) {
            this.qnaFixtures = qnaFixtures;
            return this;
        }

        public CoverLetter build() {
            CoverLetter coverLetter = new CoverLetter();

            if (id != null) {
                ReflectionTestUtils.setField(coverLetter, "id", id);
            }
            ReflectionTestUtils.setField(coverLetter, "userId", userId);
            ReflectionTestUtils.setField(coverLetter, "companyName", companyName);
            ReflectionTestUtils.setField(coverLetter, "applyYear", applyYear);
            ReflectionTestUtils.setField(coverLetter, "applyHalf", applyHalf);
            ReflectionTestUtils.setField(coverLetter, "jobPosition", jobPosition);
            ReflectionTestUtils.setField(coverLetter, "deadline", deadline);

            if (createdAt != null && modifiedAt != null) {
                ReflectionTestUtils.setField(coverLetter, "createdAt", createdAt);
                ReflectionTestUtils.setField(coverLetter, "modifiedAt", modifiedAt);
            } else if (modifiedAt != null) {
                ReflectionTestUtils.setField(coverLetter, "createdAt", modifiedAt);
                ReflectionTestUtils.setField(coverLetter, "modifiedAt", modifiedAt);
            } else {
                setAuditFields(coverLetter);
            }

            if (qnaFixtures != null) {
                for (QnAFixture fixture : qnaFixtures) {
                    QnA qna = createQnA(coverLetter, userId, fixture.question, fixture.category);
                    coverLetter.getQnAs().add(qna);
                }
            }

            return coverLetter;
        }
    }

    public static CoverLetter createMockCoverLetter(
            Long id, String userId, String companyName, String jobPosition, LocalDate deadline
    ) {
        return builder()
                .id(id)
                .userId(userId)
                .companyName(companyName)
                .jobPosition(jobPosition)
                .deadline(deadline)
                .build();
    }

    public static CoverLetter createCoverLetterWithDeadline(String userId, LocalDate deadline) {
        return builder()
                .userId(userId)
                .deadline(deadline)
                .build();
    }
}
