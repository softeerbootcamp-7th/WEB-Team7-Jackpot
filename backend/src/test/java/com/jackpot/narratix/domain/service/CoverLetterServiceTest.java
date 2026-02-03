package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.request.CreateQuestionRequest;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.TotalCoverLetterCountResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CoverLetterServiceTest {

    @InjectMocks
    private CoverLetterService coverLetterService;

    @Mock
    private CoverLetterRepository coverLetterRepository;

    @Mock
    private QnARepository qnARepository;

    @Mock
    private UserRepository userRepository;

    @Test
    @DisplayName("자기소개서 생성 성공")
    void createNewCoverLetter_성공() {
        // given
        String userId = "testUser123";
        LocalDate deadline = LocalDate.of(2024, 12, 31);

        List<CreateQuestionRequest> questions = List.of(
                new CreateQuestionRequest("지원 동기는 무엇인가요?", QuestionCategoryType.MOTIVATION),
                new CreateQuestionRequest("팀워크 경험을 설명해주세요.", QuestionCategoryType.TEAMWORK_EXPERIENCE)
        );

        CreateCoverLetterRequest request = new CreateCoverLetterRequest(
                "테스트기업",
                2024,
                ApplyHalfType.FIRST_HALF,
                "백엔드 개발자",
                deadline,
                questions
        );

        User mockUser = mock(User.class);
        CoverLetter mockCoverLetter = mock(CoverLetter.class);
        Long expectedCoverLetterId = 1L;

        given(userRepository.getReferenceById(userId)).willReturn(mockUser);
        given(coverLetterRepository.save(any(CoverLetter.class))).willReturn(mockCoverLetter);
        given(mockCoverLetter.getId()).willReturn(expectedCoverLetterId);

        // when
        CreateCoverLetterResponse response = coverLetterService.createNewCoverLetter(userId, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.coverLetterId()).isEqualTo(expectedCoverLetterId);

        verify(userRepository, times(1)).getReferenceById(userId);
        verify(coverLetterRepository, times(1)).save(any(CoverLetter.class));
        verify(qnARepository, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("자기소개서 생성 시 QnA 개수가 올바르게 저장됨")
    void createNewCoverLetter_QnA() {
        // given
        String userId = "testUser123";

        List<CreateQuestionRequest> questions = List.of(
                new CreateQuestionRequest("질문 1", QuestionCategoryType.MOTIVATION),
                new CreateQuestionRequest("질문 2", QuestionCategoryType.TEAMWORK_EXPERIENCE),
                new CreateQuestionRequest("질문 3", QuestionCategoryType.VALUES)
        );

        CreateCoverLetterRequest request = new CreateCoverLetterRequest(
                "테스트기업",
                2024,
                ApplyHalfType.FIRST_HALF,
                "백엔드 개발자",
                null,
                questions
        );

        User mockUser = mock(User.class);
        CoverLetter mockCoverLetter = mock(CoverLetter.class);
        given(mockCoverLetter.getId()).willReturn(1L);

        given(userRepository.getReferenceById(userId)).willReturn(mockUser);
        given(coverLetterRepository.save(any(CoverLetter.class))).willReturn(mockCoverLetter);

        ArgumentCaptor<List<QnA>> qnAListCaptor = ArgumentCaptor.forClass(List.class);

        // when
        coverLetterService.createNewCoverLetter(userId, request);

        // then
        verify(qnARepository).saveAll(qnAListCaptor.capture());
        List<QnA> capturedQnAs = qnAListCaptor.getValue();

        assertThat(capturedQnAs).hasSize(3);
    }

    @Test
    @DisplayName("자기소개서 생성 시 마감일이 null일 수 있음")
    void createNewCoverLetterDeadlineNull() {
        // given
        String userId = "testUser123";

        List<CreateQuestionRequest> questions = List.of(
                new CreateQuestionRequest("질문 1", QuestionCategoryType.MOTIVATION)
        );

        CreateCoverLetterRequest request = new CreateCoverLetterRequest(
                "테스트기업",
                2024,
                ApplyHalfType.SECOND_HALF,
                "프론트엔드 개발자",
                null, // deadline is null
                questions
        );

        User mockUser = mock(User.class);
        CoverLetter mockCoverLetter = mock(CoverLetter.class);
        given(mockCoverLetter.getId()).willReturn(1L);

        given(userRepository.getReferenceById(userId)).willReturn(mockUser);
        given(coverLetterRepository.save(any(CoverLetter.class))).willReturn(mockCoverLetter);

        // when
        CreateCoverLetterResponse response = coverLetterService.createNewCoverLetter(userId, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.coverLetterId()).isEqualTo(1L);

        verify(coverLetterRepository, times(1)).save(any(CoverLetter.class));
    }

    @ParameterizedTest
    @DisplayName("자기소개서 총 개수 조회 - repository 메서드 호출 검증")
    @MethodSource("provideDateAndHalfType")
    void getTotalCoverLetterCount_RepositoryMethodCalls(String dateStr, ApplyHalfType applyHalfType) {
        // given
        String userId = "testUser123";
        LocalDate date = LocalDate.parse(dateStr);
        int expectedYear = date.getYear();
        int expectedCoverLetterCount = 10;
        int expectedQnaCount = 25;
        int expectedSeasonCount = 5;

        given(coverLetterRepository.countByUserId(userId)).willReturn(expectedCoverLetterCount);
        given(qnARepository.countByUserId(userId)).willReturn(expectedQnaCount);
        given(coverLetterRepository.countByUserIdAndApplyYearAndApplyHalf(userId, expectedYear, applyHalfType))
                .willReturn(expectedSeasonCount);

        // when
        TotalCoverLetterCountResponse response = coverLetterService.getTotalCoverLetterCount(userId, date);

        // then
        assertThat(response).isNotNull();
        assertThat(response.coverLetterCount()).isEqualTo(expectedCoverLetterCount);
        assertThat(response.qnaCount()).isEqualTo(expectedQnaCount);
        assertThat(response.seasonCoverLetterCount()).isEqualTo(expectedSeasonCount);

        verify(coverLetterRepository, times(1)).countByUserId(userId);
        verify(qnARepository, times(1)).countByUserId(userId);
        verify(coverLetterRepository, times(1))
                .countByUserIdAndApplyYearAndApplyHalf(userId, expectedYear, applyHalfType);
    }

    static Stream<Arguments> provideDateAndHalfType() {
        return Stream.of(
                Arguments.of("2026-06-30", ApplyHalfType.FIRST_HALF),
                Arguments.of("2024-07-01", ApplyHalfType.SECOND_HALF)
        );
    }
}