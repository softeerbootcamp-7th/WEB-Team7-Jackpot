package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.request.CreateQuestionRequest;
import com.jackpot.narratix.domain.controller.response.CoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.TotalCoverLetterCountResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.exception.CoverLetterErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
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
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

        CoverLetter mockCoverLetter = mock(CoverLetter.class);
        Long expectedCoverLetterId = 1L;

        given(coverLetterRepository.save(any(CoverLetter.class))).willReturn(mockCoverLetter);
        given(mockCoverLetter.getId()).willReturn(expectedCoverLetterId);

        // when
        CreateCoverLetterResponse response = coverLetterService.createNewCoverLetter(userId, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.coverLetterId()).isEqualTo(expectedCoverLetterId);

        verify(coverLetterRepository, times(1)).save(any(CoverLetter.class));
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

        CoverLetter mockCoverLetter = mock(CoverLetter.class);
        given(mockCoverLetter.getId()).willReturn(1L);

        given(coverLetterRepository.save(any(CoverLetter.class))).willReturn(mockCoverLetter);

        // when
        CreateCoverLetterResponse response = coverLetterService.createNewCoverLetter(userId, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.coverLetterId()).isEqualTo(1L);

        verify(coverLetterRepository, times(1)).save(any(CoverLetter.class));
    }

    @Test
    @DisplayName("자기소개서 조회 성공")
    void findCoverLetterById_Success() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 1L;

        CoverLetter coverLetter = CoverLetter.from(
                userId,
                new CreateCoverLetterRequest(
                        "테스트기업",
                        2024,
                        ApplyHalfType.FIRST_HALF,
                        "백엔드 개발자",
                        LocalDate.of(2024, 12, 31),
                        List.of()
                )
        );
        ReflectionTestUtils.setField(coverLetter, "id", coverLetterId);

        given(coverLetterRepository.findById(coverLetterId)).willReturn(Optional.of(coverLetter));

        // when
        CoverLetterResponse response = coverLetterService.findCoverLetterById(userId, coverLetterId);

        // then
        assertThat(response.coverLetterId()).isEqualTo(coverLetterId);
        assertThat(response.companyName()).isEqualTo("테스트기업");
        assertThat(response.applyYear()).isEqualTo(2024);
        assertThat(response.applyHalf()).isEqualTo(ApplyHalfType.FIRST_HALF);
        assertThat(response.jobPosition()).isEqualTo("백엔드 개발자");
        assertThat(response.deadline()).isEqualTo(LocalDate.of(2024, 12, 31));

        verify(coverLetterRepository, times(1)).findById(coverLetterId);
    }

    @Test
    @DisplayName("존재하지 않는 자기소개서 조회 시 예외 발생")
    void findCoverLetterById_NotFound() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 999L;

        given(coverLetterRepository.findById(coverLetterId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> coverLetterService.findCoverLetterById(userId, coverLetterId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", CoverLetterErrorCode.COVER_LETTER_NOT_FOUND);

        verify(coverLetterRepository, times(1)).findById(coverLetterId);
    }

    @Test
    @DisplayName("다른 사용자의 자기소개서 조회 시 권한 예외 발생")
    void findCoverLetterById_Forbidden() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 1L;

        CoverLetter mockCoverLetter = mock(CoverLetter.class);
        given(mockCoverLetter.isOwner(userId)).willReturn(false);

        given(coverLetterRepository.findById(coverLetterId)).willReturn(Optional.of(mockCoverLetter));

        // when & then
        assertThatThrownBy(() -> coverLetterService.findCoverLetterById(userId, coverLetterId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(coverLetterRepository, times(1)).findById(coverLetterId);
        verify(mockCoverLetter, times(1)).isOwner(userId);
    }

    @Test
    @DisplayName("자기소개서 삭제 성공")
    void deleteCoverLetterById_Success() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 1L;

        CoverLetter mockCoverLetter = mock(CoverLetter.class);

        given(mockCoverLetter.isOwner(any())).willReturn(true);
        given(coverLetterRepository.findById(coverLetterId)).willReturn(Optional.of(mockCoverLetter));

        // when
        coverLetterService.deleteCoverLetterById(userId, coverLetterId);

        // then
        verify(coverLetterRepository, times(1)).findById(coverLetterId);
        verify(coverLetterRepository, times(1)).deleteById(coverLetterId);
    }

    @Test
    @DisplayName("존재하지 않는 자기소개서 삭제 시 아무 일도 일어나지 않음")
    void deleteCoverLetterById_NonExistCoverLetter() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 999L;

        given(coverLetterRepository.findById(coverLetterId)).willReturn(Optional.empty());

        // when
        coverLetterService.deleteCoverLetterById(userId, coverLetterId);

        // then
        verify(coverLetterRepository, times(1)).findById(coverLetterId);
        verify(coverLetterRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("다른 사용자의 자기소개서 삭제 시 권한 예외 발생")
    void deleteCoverLetterById_Forbidden() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 1L;

        CoverLetter mockCoverLetter = mock(CoverLetter.class);
        given(mockCoverLetter.isOwner(any())).willReturn(false);
        given(coverLetterRepository.findById(coverLetterId)).willReturn(Optional.of(mockCoverLetter));

        // when & then
        assertThatThrownBy(() -> coverLetterService.deleteCoverLetterById(userId, coverLetterId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(coverLetterRepository, times(1)).findById(coverLetterId);
        verify(coverLetterRepository, never()).deleteById(anyLong());
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