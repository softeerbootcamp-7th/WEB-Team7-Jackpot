package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.*;
import com.jackpot.narratix.domain.controller.response.*;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.UploadJob;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.exception.CoverLetterErrorCode;
import com.jackpot.narratix.domain.exception.QnAErrorCode;
import com.jackpot.narratix.domain.fixture.QnAFixture;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.UploadJobRepository;
import com.jackpot.narratix.domain.repository.dto.QnACountProjection;
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
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
    private UploadJobRepository uploadJobRepository;

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

        CoverLetter coverLetter = CoverLetter.builder()
                .userId(userId)
                .companyName("테스트기업")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .jobPosition("백엔드 개발자")
                .deadline(LocalDate.of(2024, 12, 31))
                .build();
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

    @Test
    @DisplayName("자기소개서 수정 성공")
    void editCoverLetter_AndQnA_Success() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 1L;

        CoverLetterAndQnAEditRequest editRequest = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        coverLetterId, "수정된 기업명", 2025, ApplyHalfType.SECOND_HALF, "프론트엔드 개발자", LocalDate.of(2025, 6, 30)
                ),
                List.of()
        );

        CoverLetter coverLetter = CoverLetter.builder()
                .userId(userId)
                .companyName("원래 기업명")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .jobPosition("백엔드 개발자")
                .deadline(LocalDate.of(2024, 12, 31))
                .build();
        ReflectionTestUtils.setField(coverLetter, "id", coverLetterId);

        given(coverLetterRepository.findByIdWithQnAsOrElseThrow(coverLetterId)).willReturn(coverLetter);

        // when
        coverLetterService.editCoverLetterAndQnA(userId, editRequest);

        // then
        assertThat(coverLetter.getCompanyName()).isEqualTo("수정된 기업명");
        assertThat(coverLetter.getApplyYear()).isEqualTo(2025);
        assertThat(coverLetter.getApplyHalf()).isEqualTo(ApplyHalfType.SECOND_HALF);
        assertThat(coverLetter.getJobPosition()).isEqualTo("프론트엔드 개발자");
        assertThat(coverLetter.getDeadline()).isEqualTo(LocalDate.of(2025, 6, 30));

        verify(coverLetterRepository, times(1)).findByIdWithQnAsOrElseThrow(coverLetterId);
    }

    @Test
    @DisplayName("자기소개서 수정 시 마감일을 null로 변경 가능")
    void editCoverLetter_AndQnA_DeadlineToNull() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 1L;

        CoverLetterAndQnAEditRequest editRequest = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        coverLetterId, "수정된 기업명", 2025, ApplyHalfType.SECOND_HALF, "프론트엔드 개발자", null
                ),
                List.of()
        );

        CoverLetter coverLetter = CoverLetter.builder()
                .userId(userId)
                .companyName("원래 기업명")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .jobPosition("백엔드 개발자")
                .deadline(LocalDate.of(2024, 12, 31))
                .build();
        ReflectionTestUtils.setField(coverLetter, "id", coverLetterId);

        given(coverLetterRepository.findByIdWithQnAsOrElseThrow(coverLetterId)).willReturn(coverLetter);

        // when
        coverLetterService.editCoverLetterAndQnA(userId, editRequest);

        // then
        assertThat(coverLetter.getDeadline()).isNull();
        verify(coverLetterRepository, times(1)).findByIdWithQnAsOrElseThrow(coverLetterId);
    }

    @Test
    @DisplayName("존재하지 않는 자기소개서 수정 시 예외 발생")
    void editCoverLetter_AndQnA_NotFound() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 999L;

        CoverLetterAndQnAEditRequest editRequest = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        coverLetterId, "수정된 기업명", 2025, ApplyHalfType.SECOND_HALF, "프론트엔드 개발자", LocalDate.of(2025, 6, 30)
                ),
                List.of()
        );

        given(coverLetterRepository.findByIdWithQnAsOrElseThrow(coverLetterId))
                .willThrow(new BaseException(CoverLetterErrorCode.COVER_LETTER_NOT_FOUND));

        // when & then
        assertThatThrownBy(() -> coverLetterService.editCoverLetterAndQnA(userId, editRequest))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", CoverLetterErrorCode.COVER_LETTER_NOT_FOUND);

        verify(coverLetterRepository, times(1)).findByIdWithQnAsOrElseThrow(coverLetterId);
    }

    @Test
    @DisplayName("자기소개서 소유자가 아닌 유저가 수정을 시도하면 권한 예외 발생")
    void editCoverLetter_AndQnA_OwnerForbidden() {
        // given
        String userId = "testUser123";
        String otherUserId = "otherTestUser123";
        Long coverLetterId = 1L;

        CoverLetterAndQnAEditRequest editRequest = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        coverLetterId, "수정된 기업명", 2025, ApplyHalfType.SECOND_HALF, "프론트엔드 개발자", LocalDate.of(2025, 6, 30)
                ),
                List.of()
        );

        CoverLetter coverLetter = CoverLetter.builder()
                .userId(userId)
                .companyName("원래 기업명")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .jobPosition("백엔드 개발자")
                .deadline(LocalDate.of(2024, 12, 31))
                .build();
        ReflectionTestUtils.setField(coverLetter, "id", coverLetterId);

        given(coverLetterRepository.findByIdWithQnAsOrElseThrow(coverLetterId)).willReturn(coverLetter);

        // when & then
        assertThatThrownBy(() -> coverLetterService.editCoverLetterAndQnA(otherUserId, editRequest))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(coverLetterRepository, times(1)).findByIdWithQnAsOrElseThrow(coverLetterId);
    }

    @Test
    @DisplayName("자기소개서 수정 - 기존 QnA 수정 성공")
    void editCoverLetterAndQnA_기존QnA수정_성공() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 1L;
        Long qnAId = 10L;

        CoverLetter coverLetter = CoverLetter.builder()
                .userId(userId)
                .companyName("기업명")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .jobPosition("백엔드 개발자")
                .deadline(LocalDate.of(2024, 12, 31))
                .build();
        ReflectionTestUtils.setField(coverLetter, "id", coverLetterId);

        QnA existingQnA = QnAFixture.createQnAWithId(qnAId, coverLetter, userId, "기존 질문", QuestionCategoryType.MOTIVATION);
        ReflectionTestUtils.setField(coverLetter, "qnAs", new ArrayList<>(List.of(existingQnA)));

        CoverLetterAndQnAEditRequest editRequest = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        coverLetterId, "기업명", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", null
                ),
                List.of(new CoverLetterAndQnAEditRequest.QnAEditRequest(qnAId, "수정된 질문", QuestionCategoryType.TEAMWORK_EXPERIENCE))
        );

        given(coverLetterRepository.findByIdWithQnAsOrElseThrow(coverLetterId)).willReturn(coverLetter);

        // when
        coverLetterService.editCoverLetterAndQnA(userId, editRequest);

        // then
        assertThat(coverLetter.getQnAs()).hasSize(1);
        assertThat(existingQnA.getQuestion()).isEqualTo("수정된 질문");
        assertThat(existingQnA.getQuestionCategory()).isEqualTo(QuestionCategoryType.TEAMWORK_EXPERIENCE);
    }

    @Test
    @DisplayName("자기소개서 수정 - qnAId null인 새 QnA 추가 성공")
    void editCoverLetterAndQnA_새QnA추가_성공() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 1L;
        Long existingQnAId = 10L;

        CoverLetter coverLetter = CoverLetter.builder()
                .userId(userId)
                .companyName("기업명")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .jobPosition("백엔드 개발자")
                .deadline(LocalDate.of(2024, 12, 31))
                .build();
        ReflectionTestUtils.setField(coverLetter, "id", coverLetterId);

        QnA existingQnA = QnAFixture.createQnAWithId(existingQnAId, coverLetter, userId, "기존 질문", QuestionCategoryType.MOTIVATION);
        ReflectionTestUtils.setField(coverLetter, "qnAs", new ArrayList<>(List.of(existingQnA)));

        CoverLetterAndQnAEditRequest editRequest = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        coverLetterId, "기업명", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", null
                ),
                List.of(
                        new CoverLetterAndQnAEditRequest.QnAEditRequest(existingQnAId, "기존 질문", QuestionCategoryType.MOTIVATION),
                        new CoverLetterAndQnAEditRequest.QnAEditRequest(null, "새로운 질문", QuestionCategoryType.VALUES)
                )
        );

        given(coverLetterRepository.findByIdWithQnAsOrElseThrow(coverLetterId)).willReturn(coverLetter);

        // when
        coverLetterService.editCoverLetterAndQnA(userId, editRequest);

        // then
        assertThat(coverLetter.getQnAs()).hasSize(2);
        assertThat(coverLetter.getQnAs().stream().anyMatch(q -> "새로운 질문".equals(q.getQuestion()))).isTrue();
        assertThat(coverLetter.getQnAs().stream()
                .anyMatch(q -> QuestionCategoryType.VALUES.equals(q.getQuestionCategory()))).isTrue();
    }

    @Test
    @DisplayName("자기소개서 수정 - 요청에 없는 기존 QnA 삭제 성공")
    void editCoverLetterAndQnA_기존QnA삭제_성공() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 1L;

        CoverLetter coverLetter = CoverLetter.builder()
                .userId(userId)
                .companyName("기업명")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .jobPosition("백엔드 개발자")
                .deadline(LocalDate.of(2024, 12, 31))
                .build();
        ReflectionTestUtils.setField(coverLetter, "id", coverLetterId);

        QnA qnAToKeep = QnAFixture.createQnAWithId(10L, coverLetter, userId, "유지할 질문", QuestionCategoryType.MOTIVATION);
        QnA qnAToDelete = QnAFixture.createQnAWithId(11L, coverLetter, userId, "삭제될 질문", QuestionCategoryType.VALUES);
        ReflectionTestUtils.setField(coverLetter, "qnAs", new ArrayList<>(List.of(qnAToKeep, qnAToDelete)));

        // 11L은 요청에서 제외 → 삭제 대상
        CoverLetterAndQnAEditRequest editRequest = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        coverLetterId, "기업명", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", null
                ),
                List.of(new CoverLetterAndQnAEditRequest.QnAEditRequest(10L, "유지할 질문", QuestionCategoryType.MOTIVATION))
        );

        given(coverLetterRepository.findByIdWithQnAsOrElseThrow(coverLetterId)).willReturn(coverLetter);

        // when
        coverLetterService.editCoverLetterAndQnA(userId, editRequest);

        // then
        assertThat(coverLetter.getQnAs()).hasSize(1);
        assertThat(coverLetter.getQnAs().get(0).getQuestion()).isEqualTo("유지할 질문");
    }

    @Test
    @DisplayName("자기소개서 수정 - 추가/수정/삭제 혼합 처리 성공")
    void editCoverLetterAndQnA_혼합처리_성공() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 1L;

        CoverLetter coverLetter = CoverLetter.builder()
                .userId(userId)
                .companyName("기업명")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .jobPosition("백엔드 개발자")
                .deadline(LocalDate.of(2024, 12, 31))
                .build();
        ReflectionTestUtils.setField(coverLetter, "id", coverLetterId);

        QnA qnAToUpdate = QnAFixture.createQnAWithId(10L, coverLetter, userId, "수정 전 질문", QuestionCategoryType.MOTIVATION);
        QnA qnAToDelete = QnAFixture.createQnAWithId(11L, coverLetter, userId, "삭제될 질문", QuestionCategoryType.VALUES);
        ReflectionTestUtils.setField(coverLetter, "qnAs", new ArrayList<>(List.of(qnAToUpdate, qnAToDelete)));

        // 10L 수정, 11L 삭제, null 새 문항 추가
        CoverLetterAndQnAEditRequest editRequest = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        coverLetterId, "기업명", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", null
                ),
                List.of(
                        new CoverLetterAndQnAEditRequest.QnAEditRequest(10L, "수정 후 질문", QuestionCategoryType.JOB_SKILL),
                        new CoverLetterAndQnAEditRequest.QnAEditRequest(null, "새로운 질문", QuestionCategoryType.FUTURE_PLAN)
                )
        );

        given(coverLetterRepository.findByIdWithQnAsOrElseThrow(coverLetterId)).willReturn(coverLetter);

        // when
        coverLetterService.editCoverLetterAndQnA(userId, editRequest);

        // then: 10L 수정됨, 11L 삭제됨, 새 QnA 추가됨 → 총 2개
        assertThat(coverLetter.getQnAs()).hasSize(2);
        assertThat(qnAToUpdate.getQuestion()).isEqualTo("수정 후 질문");
        assertThat(qnAToUpdate.getQuestionCategory()).isEqualTo(QuestionCategoryType.JOB_SKILL);
        assertThat(coverLetter.getQnAs().stream().noneMatch(q -> q == qnAToDelete)).isTrue();
        assertThat(coverLetter.getQnAs().stream().anyMatch(q -> "새로운 질문".equals(q.getQuestion()))).isTrue();
    }

    @Test
    @DisplayName("자기소개서 수정 - 자기소개서에 없는 qnAId 수정 시도 시 QNA_NOT_FOUND 예외 발생")
    void editCoverLetterAndQnA_존재하지않는QnAId_예외발생() {
        // given
        String userId = "testUser123";
        Long coverLetterId = 1L;

        CoverLetter coverLetter = CoverLetter.builder()
                .userId(userId)
                .companyName("기업명")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .jobPosition("백엔드 개발자")
                .deadline(LocalDate.of(2024, 12, 31))
                .build();
        ReflectionTestUtils.setField(coverLetter, "id", coverLetterId);

        QnA existingQnA = QnAFixture.createQnAWithId(10L, coverLetter, userId, "기존 질문", QuestionCategoryType.MOTIVATION);
        ReflectionTestUtils.setField(coverLetter, "qnAs", new ArrayList<>(List.of(existingQnA)));

        // 99L은 이 자기소개서에 속하지 않는 qnAId
        CoverLetterAndQnAEditRequest editRequest = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        coverLetterId, "기업명", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", null
                ),
                List.of(new CoverLetterAndQnAEditRequest.QnAEditRequest(99L, "수정 질문", QuestionCategoryType.VALUES))
        );

        given(coverLetterRepository.findByIdWithQnAsOrElseThrow(coverLetterId)).willReturn(coverLetter);

        // when & then
        assertThatThrownBy(() -> coverLetterService.editCoverLetterAndQnA(userId, editRequest))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", QnAErrorCode.QNA_NOT_FOUND);
    }

    @Test
    @DisplayName("필터링된 자기소개서 리스트 조회 성공 - QnA 개수 포함")
    void getAllCoverLetterByFilter_Success_WithQnaCount() {
        // given
        String userId = "testUser123";
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Integer size = 10;
        CoverLetterFilterRequest request = new CoverLetterFilterRequest(
                startDate, endDate, size, null, null
        );

        CoverLetter coverLetter1 = createMockCoverLetter(1L, userId, "현대자동차", LocalDate.of(2024, 6, 15));
        CoverLetter coverLetter2 = createMockCoverLetter(2L, userId, "삼성전자", LocalDate.of(2024, 8, 20));

        List<CoverLetter> coverLetters = List.of(coverLetter1, coverLetter2);
        Slice<CoverLetter> slice = new SliceImpl<>(coverLetters, Pageable.unpaged(), false);
        List<QnACountProjection> qnaCounts = List.of(
                new QnACountProjection(1L, 3L),
                new QnACountProjection(2L, 5L)
        );

        given(coverLetterRepository.findByFilter(userId, startDate, endDate, null, null, size))
                .willReturn(slice);
        given(qnARepository.countByCoverLetterIdIn(List.of(1L, 2L))).willReturn(qnaCounts);
        given(coverLetterRepository.countByFilter(userId, startDate, endDate, null)).willReturn(2L);

        // when
        FilteredCoverLettersResponse response = coverLetterService.getAllCoverLetterByFilter(
                userId, request
        );

        // then
        assertThat(response).isNotNull();
        assertThat(response.totalCount()).isEqualTo(2);
        assertThat(response.coverLetters()).hasSize(2);
        assertThat(response.coverLetters().get(0).coverLetterId()).isEqualTo(1L);
        assertThat(response.coverLetters().get(0).companyName()).isEqualTo("현대자동차");
        assertThat(response.coverLetters().get(0).questionCount()).isEqualTo(3);
        assertThat(response.coverLetters().get(1).coverLetterId()).isEqualTo(2L);
        assertThat(response.coverLetters().get(1).companyName()).isEqualTo("삼성전자");
        assertThat(response.coverLetters().get(1).questionCount()).isEqualTo(5);
        assertThat(response.hasNext()).isFalse();

        verify(coverLetterRepository, times(1))
                .findByFilter(userId, startDate, endDate, null, null, size);
        verify(qnARepository, times(1)).countByCoverLetterIdIn(List.of(1L, 2L));
        verify(coverLetterRepository, times(1)).countByFilter(userId, startDate, endDate, null);
    }

    @Test
    @DisplayName("필터링된 자기소개서 리스트 조회 - 빈 리스트 반환")
    void getAllCoverLetterByFilter_EmptyList() {
        // given
        String userId = "testUser123";
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Integer size = 10;
        CoverLetterFilterRequest request = new CoverLetterFilterRequest(
                startDate, endDate, size, null, null
        );

        Slice<CoverLetter> emptySlice = new SliceImpl<>(List.of(), Pageable.unpaged(), false);

        given(coverLetterRepository.findByFilter(
                userId, startDate, endDate, null, null, size
        )).willReturn(emptySlice);

        given(coverLetterRepository.countByFilter(userId, startDate, endDate, null))
                .willReturn(0L);

        // when
        FilteredCoverLettersResponse response = coverLetterService.getAllCoverLetterByFilter(
                userId, request
        );

        // then
        assertThat(response).isNotNull();
        assertThat(response.totalCount()).isZero();
        assertThat(response.coverLetters()).isEmpty();
        assertThat(response.hasNext()).isFalse();

        verify(coverLetterRepository, times(1))
                .findByFilter(userId, startDate, endDate, null, null, size);
        verify(qnARepository, never()).countByCoverLetterIdIn(any());
        verify(coverLetterRepository, times(1)).countByFilter(userId, startDate, endDate, null);
    }

    @Test
    @DisplayName("필터링된 자기소개서 리스트 조회 - QnA가 없는 경우 0 반환")
    void getAllCoverLetterByFilter_WithoutQnA() {
        // given
        String userId = "testUser123";
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Integer size = 10;
        CoverLetterFilterRequest request = new CoverLetterFilterRequest(
                startDate, endDate, size, null, null
        );

        CoverLetter coverLetter = createMockCoverLetter(1L, userId, "네이버", LocalDate.of(2024, 5, 10));
        List<CoverLetter> coverLetters = List.of(coverLetter);
        Slice<CoverLetter> slice = new SliceImpl<>(coverLetters, Pageable.unpaged(), false);

        given(coverLetterRepository.findByFilter(
                userId, startDate, endDate, null, null, size
        )).willReturn(slice);
        given(qnARepository.countByCoverLetterIdIn(List.of(1L))).willReturn(List.of());
        given(coverLetterRepository.countByFilter(userId, startDate, endDate, null)).willReturn(1L);

        // when
        FilteredCoverLettersResponse response = coverLetterService.getAllCoverLetterByFilter(
                userId, request
        );

        // then
        assertThat(response).isNotNull();
        assertThat(response.totalCount()).isEqualTo(1);
        assertThat(response.coverLetters()).hasSize(1);
        assertThat(response.coverLetters().get(0).questionCount()).isZero();
        assertThat(response.hasNext()).isFalse();

        verify(coverLetterRepository, times(1))
                .findByFilter(userId, startDate, endDate, null, null, size);
        verify(qnARepository, times(1)).countByCoverLetterIdIn(List.of(1L));
        verify(coverLetterRepository, times(1)).countByFilter(userId, startDate, endDate, null);
    }

    @Test
    @DisplayName("필터링된 자기소개서 리스트 조회 - size 적용 확인")
    void getAllCoverLetterByFilter_SizeApplied() {
        // given
        String userId = "testUser123";
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Integer size = 5;
        CoverLetterFilterRequest request = new CoverLetterFilterRequest(
                startDate, endDate, size, null, null
        );

        ArgumentCaptor<Integer> sizeCaptor = ArgumentCaptor.forClass(Integer.class);
        Slice<CoverLetter> emptySlice = new SliceImpl<>(List.of(), Pageable.unpaged(), false);

        given(coverLetterRepository.findByFilter(
                eq(userId), eq(startDate), eq(endDate), eq(null), eq(null), sizeCaptor.capture()
        )).willReturn(emptySlice);

        // when
        coverLetterService.getAllCoverLetterByFilter(userId, request);

        // then
        Integer capturedSize = sizeCaptor.getValue();
        assertThat(capturedSize).isEqualTo(5);

        verify(coverLetterRepository, times(1))
                .findByFilter(userId, startDate, endDate, null, null, size);
    }

    private CoverLetter createMockCoverLetter(Long id, String userId, String companyName, LocalDate deadline) {
        CoverLetter coverLetter = CoverLetter.builder()
                .userId(userId)
                .companyName(companyName)
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .jobPosition("백엔드 개발자")
                .deadline(deadline)
                .build();
        ReflectionTestUtils.setField(coverLetter, "id", id);
        return coverLetter;
    }

    @Test
    @DisplayName("다가오는 자기소개서 조회 성공")
    void getUpcomingCoverLetters_ThreeDeadlines_TwoEach() {
        // given
        String userId = "testUser123";
        LocalDate queryDate = LocalDate.of(2024, 6, 1);

        // deadline 1: 2024-06-15 (자기소개서 3개, modifiedAt이 다름)
        LocalDate deadline1 = LocalDate.of(2026, 6, 15);
        CoverLetter cl1 = createMockCoverLetter(1L, userId, "기업A", deadline1);
        CoverLetter cl2 = createMockCoverLetter(2L, userId, "기업B", deadline1);

        // deadline 2: 2024-06-20 (자기소개서 2개)
        LocalDate deadline2 = LocalDate.of(2026, 6, 20);
        CoverLetter cl4 = createMockCoverLetter(4L, userId, "기업D", deadline2);
        CoverLetter cl5 = createMockCoverLetter(5L, userId, "기업E", deadline2);

        // deadline 3: 2024-06-25 (자기소개서 1개)
        LocalDate deadline3 = LocalDate.of(2026, 6, 25);
        CoverLetter cl6 = createMockCoverLetter(6L, userId, "기업F", deadline3);


        // Repository가 deadline별로 modifiedAt desc 정렬된 최대 2개씩, 최대 3개 deadline 반환
        Map<LocalDate, List<CoverLetter>> linkedHashMap = new LinkedHashMap<>();
        linkedHashMap.put(deadline1, List.of(cl2, cl1));
        linkedHashMap.put(deadline2, List.of(cl5, cl4));
        linkedHashMap.put(deadline3, List.of(cl6));

        given(coverLetterRepository.findUpcomingCoverLettersGroupedByDeadline(userId, queryDate, 3, 2))
                .willReturn(linkedHashMap);

        // when
        List<UpcomingCoverLetterResponse> result = coverLetterService.getUpcomingCoverLetters(
                userId, queryDate, 3, 2
        );

        // then
        assertThat(result).hasSize(3);

        // 첫 번째 deadline (2024-06-15)
        assertThat(result.get(0).deadline()).isEqualTo(deadline1);
        assertThat(result.get(0).coverLetters()).hasSize(2);

        // 가장 최근에 수정한 자기소개서부터 반환 (modified_at desc)
        assertThat(result.get(0).coverLetters().get(0).coverLetterId()).isEqualTo(2L);
        assertThat(result.get(0).coverLetters().get(1).coverLetterId()).isEqualTo(1L);

        // 두 번째 deadline (2024-06-20)
        assertThat(result.get(1).deadline()).isEqualTo(deadline2);
        assertThat(result.get(1).coverLetters()).hasSize(2);

        // 세 번째 deadline (2024-06-25)
        assertThat(result.get(2).deadline()).isEqualTo(deadline3);
        assertThat(result.get(2).coverLetters()).hasSize(1);

        verify(coverLetterRepository, times(1)).findUpcomingCoverLettersGroupedByDeadline(userId, queryDate, 3, 2);
    }

    @Test
    @DisplayName("다가오는 자기소개서 조회 - deadline이 없는 경우 빈 리스트 반환")
    void getUpcomingCoverLetters_NoDeadlines_EmptyList() {
        // given
        String userId = "testUser123";
        LocalDate queryDate = LocalDate.of(2024, 6, 1);

        given(coverLetterRepository.findUpcomingCoverLettersGroupedByDeadline(userId, queryDate, 3, 2))
                .willReturn(Map.of());

        // when
        var result = coverLetterService.getUpcomingCoverLetters(userId, queryDate, 3, 2);

        // then
        assertThat(result).isEmpty();
        verify(coverLetterRepository, times(1)).findUpcomingCoverLettersGroupedByDeadline(userId, queryDate, 3, 2);
    }

    @Test
    @DisplayName("날짜 범위로 마감일 조회 시 1개월 초과 시 예외 발생")
    void findDeadlineByDateRange_ExceedsOneMonth_ThrowsException() {
        // given
        String userId = "testUser123";
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 2, 2);  // 1개월 + 1일

        // when & then
        assertThatThrownBy(() -> coverLetterService.findDeadlineByDateRange(userId, startDate, endDate))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", CoverLetterErrorCode.DATE_RANGE_EXCEEDED);

        verify(coverLetterRepository, never()).findDeadlineByUserIdBetweenDeadline(any(), any(), any());
    }

    @Test
    @DisplayName("업로드된 자기소개서 1개 저장 및 UploadJob 삭제 성공")
    void saveCoverLetterAndDeleteJob_SingleJobComplete() {
        // given
        String userId = "testUser123";
        String uploadJobId = "01JPZTEST001";

        CoverLettersSaveRequest request = new CoverLettersSaveRequest(
                List.of(
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                                        "현대자동차", "백엔드 개발자", 2024, ApplyHalfType.FIRST_HALF, LocalDate.of(2024, 12, 31)
                                ),
                                List.of(
                                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.QnASaveRequest(
                                                "지원동기를 입력해주세요.", "저는 개발자입니다.", QuestionCategoryType.MOTIVATION
                                        )
                                )
                        )
                )
        );

        CoverLetter savedCoverLetter = mock(CoverLetter.class);
        given(coverLetterRepository.saveAll(any())).willReturn(List.of(savedCoverLetter));

        UploadJob mockUploadJob = mock(UploadJob.class);
        given(mockUploadJob.isOwner(userId)).willReturn(true);
        given(uploadJobRepository.findById(uploadJobId)).willReturn(Optional.of(mockUploadJob));

        // when
        SavedCoverLetterCountResponse response = coverLetterService.saveCoverLetterAndDeleteJob(userId, uploadJobId, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.savedCoverLetterCount()).isEqualTo(1);

        verify(coverLetterRepository, times(1)).saveAll(any());
        verify(uploadJobRepository, times(1)).deleteById(uploadJobId);
    }

    @Test
    @DisplayName("업로드된 자기소개서 3개 저장 및 UploadJob 삭제 성공")
    void saveCoverLetterAndDeleteJob_MultipleJobComplete() {
        // given
        String userId = "testUser123";
        String uploadJobId = "01JPZTEST001";

        CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.QnASaveRequest qnaReq =
                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.QnASaveRequest(
                        "지원동기를 입력해주세요.", "저는 개발자입니다.", QuestionCategoryType.MOTIVATION
                );

        CoverLettersSaveRequest request = new CoverLettersSaveRequest(
                List.of(
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                                        "현대자동차", "백엔드 개발자", 2024, ApplyHalfType.FIRST_HALF, LocalDate.of(2024, 6, 30)
                                ),
                                List.of(qnaReq)
                        ),
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                                        "삼성전자", "프론트엔드 개발자", 2024, ApplyHalfType.SECOND_HALF, LocalDate.of(2024, 12, 31)
                                ),
                                List.of(qnaReq)
                        ),
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                                        "네이버", "백엔드 개발자", 2024, ApplyHalfType.FIRST_HALF, LocalDate.of(2024, 5, 31)
                                ),
                                List.of(qnaReq)
                        )
                )
        );

        List<CoverLetter> savedCoverLetters = List.of(
                mock(CoverLetter.class), mock(CoverLetter.class), mock(CoverLetter.class)
        );
        given(coverLetterRepository.saveAll(any())).willReturn(savedCoverLetters);

        UploadJob mockUploadJob = mock(UploadJob.class);
        given(mockUploadJob.isOwner(userId)).willReturn(true);
        given(uploadJobRepository.findById(uploadJobId)).willReturn(Optional.of(mockUploadJob));

        // when
        SavedCoverLetterCountResponse response = coverLetterService.saveCoverLetterAndDeleteJob(userId, uploadJobId, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.savedCoverLetterCount()).isEqualTo(3);

        verify(coverLetterRepository, times(1)).saveAll(any());
        verify(uploadJobRepository, times(1)).deleteById(uploadJobId);
    }

    @Test
    @DisplayName("업로드된 자기소개서 저장 시 올바른 userId와 필드를 가진 엔티티가 전달된다")
    void saveCoverLetterAndDeleteJob_CorrectEntity() {
        // given
        String userId = "testUser123";
        String uploadJobId = "01JPZTEST001";

        CoverLettersSaveRequest request = new CoverLettersSaveRequest(
                List.of(
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                                        "현대자동차", "백엔드 개발자", 2024, ApplyHalfType.FIRST_HALF, LocalDate.of(2024, 12, 31)
                                ),
                                List.of(
                                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.QnASaveRequest(
                                                "지원동기를 입력해주세요.", "저는 개발자입니다.", QuestionCategoryType.MOTIVATION
                                        )
                                )
                        )
                )
        );

        ArgumentCaptor<List<CoverLetter>> coverLetterCaptor = ArgumentCaptor.forClass(List.class);
        given(coverLetterRepository.saveAll(coverLetterCaptor.capture()))
                .willReturn(List.of(mock(CoverLetter.class)));

        // when
        coverLetterService.saveCoverLetterAndDeleteJob(userId, uploadJobId, request);

        // then
        List<CoverLetter> capturedCoverLetters = coverLetterCaptor.getValue();
        assertThat(capturedCoverLetters).hasSize(1);

        CoverLetter capturedCoverLetter = capturedCoverLetters.get(0);
        assertThat(capturedCoverLetter.getUserId()).isEqualTo(userId);
        assertThat(capturedCoverLetter.getCompanyName()).isEqualTo("현대자동차");
        assertThat(capturedCoverLetter.getJobPosition()).isEqualTo("백엔드 개발자");
        assertThat(capturedCoverLetter.getApplyYear()).isEqualTo(2024);
        assertThat(capturedCoverLetter.getApplyHalf()).isEqualTo(ApplyHalfType.FIRST_HALF);
        assertThat(capturedCoverLetter.getDeadline()).isEqualTo(LocalDate.of(2024, 12, 31));
        assertThat(capturedCoverLetter.getQnAs()).hasSize(1);
    }

    @Test
    @DisplayName("사용자 ID로 지원한 회사 목록 조회")
    void getCompaniesTest() {
        // given
        String userId = "user123";
        List<String> mockCompanies = List.of("Samsung", "Naver", "Kakao");
        given(coverLetterRepository.findCompanyNamesByUserId(userId)).willReturn(mockCompanies);

        // when
        List<String> result = coverLetterService.getCompanies(userId);

        // then
        assertThat(result).containsExactlyInAnyOrder("Samsung", "Naver", "Kakao");
        verify(coverLetterRepository, times(1)).findCompanyNamesByUserId(userId);
    }

    @Test
    @DisplayName("사용자 ID로 지원한 직무 목록 조회")
    void getJobPositionsTest() {
        // given
        String userId = "user123";
        List<String> mockPositions = List.of("Backend Engineer", "Frontend Engineer");
        given(coverLetterRepository.findJobPositionsByUserId(userId)).willReturn(mockPositions);

        // when
        List<String> result = coverLetterService.getJobPositions(userId);

        // then
        assertThat(result).hasSize(2).containsExactly("Backend Engineer", "Frontend Engineer");
        verify(coverLetterRepository, times(1)).findJobPositionsByUserId(userId);
    }
}