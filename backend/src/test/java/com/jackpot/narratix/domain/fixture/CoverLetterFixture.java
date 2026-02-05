package com.jackpot.narratix.domain.fixture;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
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

    public static CoverLetter createMockCoverLetter(
            Long id, String userId, String companyName, String jobPosition, LocalDate deadline
    ) {
        CoverLetter coverLetter = CoverLetter.from(
                userId,
                new CreateCoverLetterRequest(
                        companyName,
                        deadline.getYear(),
                        ApplyHalfType.FIRST_HALF,
                        jobPosition,
                        deadline,
                        List.of()
                )
        );
        ReflectionTestUtils.setField(coverLetter, "id", id);
        return coverLetter;
    }

    public static CoverLetter createCoverLetterWithDeadlineAndModifiedAt(
            String userId, LocalDate deadline, LocalDateTime modifiedAt
    ) {
        CoverLetter coverLetter = new CoverLetter();
        ReflectionTestUtils.setField(coverLetter, "userId", userId);
        ReflectionTestUtils.setField(coverLetter, "companyName", "테스트기업");
        ReflectionTestUtils.setField(coverLetter, "applyYear", deadline.getYear());
        ReflectionTestUtils.setField(coverLetter, "applyHalf", ApplyHalfType.FIRST_HALF);
        ReflectionTestUtils.setField(coverLetter, "jobPosition", "백엔드 개발자");
        ReflectionTestUtils.setField(coverLetter, "deadline", deadline);
        ReflectionTestUtils.setField(coverLetter, "createdAt", modifiedAt);
        ReflectionTestUtils.setField(coverLetter, "modifiedAt", modifiedAt);
        return coverLetter;
    }

    public static CoverLetter createCoverLetterWithQnAs(String userId, List<QnAFixture> qnaFixtures) {
        CoverLetter coverLetter = createCoverLetter(userId);

        for (QnAFixture fixture : qnaFixtures) {
            QnA qna = createQnA(coverLetter, userId, fixture.question, fixture.category);
            coverLetter.getQnAs().add(qna);
        }

        return coverLetter;
    }

    public static CoverLetter createCoverLetter(String userId) {
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

    public static CoverLetter createCoverLetterWithDeadline(String userId, LocalDate deadline) {
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
}
