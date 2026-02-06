package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.request.CreateQuestionRequest;
import com.jackpot.narratix.domain.controller.response.CompanyLibraryResponse;
import com.jackpot.narratix.domain.controller.response.QuestionLibraryResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.LibraryType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LibraryServiceTest {

    @InjectMocks
    private LibraryService libraryService;

    @Mock
    private CoverLetterRepository coverLetterRepository;

    @Mock
    private QnARepository qnARepository;

    private final String userId = "test-user";

    @Test
    @DisplayName("기업명 라이브러리 조회 성공 - 리포지토리 결과 그대로 반환")
    void getLibraryList_Company() {
        // given
        LibraryType type = LibraryType.COMPANY;

        List<String> expectedCompanies = List.of("삼성전자", "네이버", "카카오");

        given(coverLetterRepository.findCompanyNamesByUserId(userId))
                .willReturn(expectedCompanies);

        // when
        List<String> result = libraryService.getLibraryList(userId, type);

        // then
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly("삼성전자", "네이버", "카카오");

        verify(coverLetterRepository).findCompanyNamesByUserId(userId);
    }

    @Test
    @DisplayName("문항유형 라이브러리 조회 성공 - Enum이 한글 설명으로 변환되어 반환")
    void getLibraryList_Question() {
        // given
        LibraryType type = LibraryType.QUESTION;

        List<QuestionCategoryType> enumList = List.of(
                QuestionCategoryType.MOTIVATION,
                QuestionCategoryType.GROWTH_PROCESS
        );

        given(qnARepository.findQuestionCategoryByUserId(userId))
                .willReturn(enumList);

        // when
        List<String> result = libraryService.getLibraryList(userId, type);

        // then
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly("지원동기", "성장과정");

        verify(qnARepository).findQuestionCategoryByUserId(userId);
    }

    @Test
    @DisplayName("데이터가 없을 때 - 빈 리스트를 반환해야 함 (에러 X)")
    void getLibraryList_Empty() {
        // given
        LibraryType type = LibraryType.COMPANY;

        given(coverLetterRepository.findCompanyNamesByUserId(userId))
                .willReturn(List.of());

        // when
        List<String> result = libraryService.getLibraryList(userId, type);

        // then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("문항유형 데이터가 없을 때 - 빈 리스트를 반환해야 함")
    void getLibraryList_Question_Empty() {
        // given
        LibraryType type = LibraryType.QUESTION;

        given(qnARepository.findQuestionCategoryByUserId(userId))
                .willReturn(List.of());

        // when
        List<String> result = libraryService.getLibraryList(userId, type);

        // then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("기업별 자소서 조회 - 첫 스크롤")
    void getCompanyLibraries_FirstPage() {
        // given
        String companyName = "Samsung";
        int size = 10;

        CoverLetter coverLetter = createMockCoverLetter(1L, userId, companyName, LocalDate.now());

        List<CoverLetter> content = List.of(coverLetter);
        Slice<CoverLetter> slice = new SliceImpl<>(content, PageRequest.ofSize(size), true);

        // Mocking 설정
        when(coverLetterRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                eq(userId), eq(companyName), any(Pageable.class))
        ).thenReturn(slice);

        when(qnARepository.countByCoverLetterIdIn(anyList())).thenReturn(List.of());

        // when
        CompanyLibraryResponse response = libraryService.getCompanyLibrary(userId, companyName, size, Optional.empty());

        // then
        assertThat(response.coverLetters()).hasSize(1);
        assertThat(response.hasNext()).isTrue();
        assertThat(response.coverLetters().get(0).id()).isEqualTo(1L);

        verify(coverLetterRepository, never()).findByIdOrElseThrow(anyLong());
        verify(coverLetterRepository).findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                eq(userId), eq(companyName), any(Pageable.class));
    }

    @Test
    @DisplayName("기업별 자소서 조회 - 다음 스크롤")
    void getCompanyLibraries_NextPage() {
        // given
        String companyName = "Samsung";
        int size = 10;
        Long lastId = 100L;

        // 마지막 자소서 정보 (커서 역할)
        CoverLetter lastCoverLetter = createMockCoverLetter(lastId, userId, companyName, LocalDate.now());
        LocalDateTime mockDateTime = lastCoverLetter.getModifiedAt();

        when(coverLetterRepository.findByIdOrElseThrow(lastId)).thenReturn(lastCoverLetter);

        // 실제 조회될 결과 데이터
        CoverLetter nextCoverLetter = createMockCoverLetter(200L, userId, companyName, LocalDate.now());
        List<CoverLetter> content = List.of(nextCoverLetter);
        Slice<CoverLetter> slice = new SliceImpl<>(content, PageRequest.ofSize(size), false);

        when(coverLetterRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                eq(userId), eq(companyName), eq(mockDateTime), any(Pageable.class))
        ).thenReturn(slice);

        when(qnARepository.countByCoverLetterIdIn(anyList())).thenReturn(List.of());

        // when
        CompanyLibraryResponse response = libraryService.getCompanyLibrary(userId, companyName, size, Optional.of(lastId));

        // then
        assertThat(response.coverLetters()).hasSize(1);
        assertThat(response.hasNext()).isFalse();
        assertThat(response.coverLetters().get(0).id()).isEqualTo(200L);

        verify(coverLetterRepository).findByIdOrElseThrow(lastId);
        verify(coverLetterRepository).findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                eq(userId), eq(companyName), eq(mockDateTime), any(Pageable.class));
    }

    @Test
    @DisplayName("기업별 자소서 조회 - 최신 수정순(ModifiedAt Desc) 정렬 검증")
    void getCompanyLibraries_SortingCheck() {
        // given
        String companyName = "Samsung";
        int size = 10;

        LocalDateTime now = LocalDateTime.now();

        CoverLetter oldCoverLetter = createMockCoverLetter(1L, userId, companyName, LocalDate.now());
        ReflectionTestUtils.setField(oldCoverLetter, "modifiedAt", now.minusHours(1));

        CoverLetter newCoverLetter = createMockCoverLetter(2L, userId, companyName, LocalDate.now());
        ReflectionTestUtils.setField(newCoverLetter, "modifiedAt", now);

        List<CoverLetter> sortedContent = List.of(newCoverLetter, oldCoverLetter);
        Slice<CoverLetter> slice = new SliceImpl<>(sortedContent, PageRequest.ofSize(size), false);

        when(coverLetterRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                eq(userId), eq(companyName), any(Pageable.class))
        ).thenReturn(slice);

        when(qnARepository.countByCoverLetterIdIn(anyList())).thenReturn(List.of());

        // when
        CompanyLibraryResponse response = libraryService.getCompanyLibrary(userId, companyName, size, Optional.empty());

        // then
        assertThat(response.coverLetters()).hasSize(2);

        assertThat(response.coverLetters().get(0).id()).isEqualTo(2L);
        assertThat(response.coverLetters().get(1).id()).isEqualTo(1L);
    }

    @Test
    @DisplayName("문항유형별 자소서 조회 - 첫 스크롤 (lastQuestionId 없음)")
    void getQuestionLibrary_FirstPage() {
        // given
        QuestionCategoryType category = QuestionCategoryType.MOTIVATION;
        int size = 2;

        CoverLetter mockCoverLetter1 = createMockCoverLetter(100L, userId, "삼성전자", LocalDate.now());
        CoverLetter mockCoverLetter2 = createMockCoverLetter(100L, userId, "현대", LocalDate.now());
        QnA qna1 = createMockQnA(1L, mockCoverLetter1, "지원동기", "질문1", "답변1");
        QnA qna2 = createMockQnA(2L, mockCoverLetter2, "지원동기", "질문2", "답변2");
        List<QnA> content = List.of(qna1, qna2);

        Slice<QnA> slice = new SliceImpl<>(content, PageRequest.ofSize(size), true);

        when(qnARepository.findByUserIdAndQuestionCategoryTypeOrderByModifiedAtDesc(
                eq(userId), eq(category), any(Pageable.class)))
                .thenReturn(slice);
        // when
        QuestionLibraryResponse response = libraryService.getQuestionLibrary(
                userId, category, size, Optional.empty());

        // then
        assertThat(response.qnAs()).hasSize(2);
        assertThat(response.hasNext()).isTrue();
        assertThat(response.qnAs().get(0).question()).isEqualTo("질문1");
        assertThat(response.qnAs().get(0).companyName()).isEqualTo("삼성전자");

        verify(qnARepository, times(1))
                .findByUserIdAndQuestionCategoryTypeOrderByModifiedAtDesc(eq(userId), eq(category), any(Pageable.class));
    }

    @Test
    @DisplayName("문항유형별 자소서 조회 - 다음 스크롤 (lastQuestionId 있음)")
    void getQuestionLibrary_NextPage() {
        // given
        Long lastId = 10L;
        QuestionCategoryType category = QuestionCategoryType.MOTIVATION;

        CoverLetter mockCoverLetter = createMockCoverLetter(100L, userId, "네이버", LocalDate.now());

        QnA lastQnA = createMockQnA(lastId, mockCoverLetter, "지원동기", "기준질문", "기준답변");

        LocalDateTime criteriaTime = lastQnA.getModifiedAt();

        QnA nextQnA = createMockQnA(11L, mockCoverLetter, "지원동기", "다음질문", "다음답변");
        Slice<QnA> slice = new SliceImpl<>(List.of(nextQnA), PageRequest.ofSize(10), false);

        given(qnARepository.findByIdOrElseThrow(lastId)).willReturn(lastQnA);

        given(qnARepository.findByUserIdAndQuestionCategoryTypeOrderByModifiedAtDesc(
                eq(userId), eq(category), eq(criteriaTime), any(Pageable.class)))
                .willReturn(slice);

        // when
        QuestionLibraryResponse response = libraryService.getQuestionLibrary(
                userId, category, 10, Optional.of(lastId));

        // then
        assertThat(response.qnAs()).hasSize(1);
        assertThat(response.qnAs().get(0).question()).isEqualTo("다음질문");

        verify(qnARepository).findByIdOrElseThrow(lastId);
        verify(qnARepository).findByUserIdAndQuestionCategoryTypeOrderByModifiedAtDesc(
                eq(userId), eq(category), eq(criteriaTime), any(Pageable.class));
    }

    @Test
    @DisplayName("문항유형별 자소서 조회 - 최신 수정순(ModifiedAt Desc) 정렬 검증")
    void getQuestionLibrary_SortingCheck() {
        // given
        QuestionCategoryType category = QuestionCategoryType.MOTIVATION;
        int size = 10;
        LocalDateTime now = LocalDateTime.now();

        // 1. 서로 다른 수정 시간을 가진 데이터 준비
        CoverLetter mockCoverLetter = createMockCoverLetter(100L, userId, "삼성전자", LocalDate.now());

        QnA oldQna = createMockQnA(1L, mockCoverLetter, category.getDescription(), "옛날 질문", "답변");
        ReflectionTestUtils.setField(oldQna, "modifiedAt", now.minusHours(2));

        QnA midQna = createMockQnA(2L, mockCoverLetter, category.getDescription(), "중간 질문", "답변");
        ReflectionTestUtils.setField(midQna, "modifiedAt", now.minusHours(1));

        QnA newQna = createMockQnA(3L, mockCoverLetter, category.getDescription(), "최신 질문", "답변");
        ReflectionTestUtils.setField(newQna, "modifiedAt", now);

        List<QnA> sortedContent = List.of(newQna, midQna, oldQna);
        Slice<QnA> slice = new SliceImpl<>(sortedContent, PageRequest.ofSize(size), false);

        when(qnARepository.findByUserIdAndQuestionCategoryTypeOrderByModifiedAtDesc(
                eq(userId), eq(category), any(Pageable.class)))
                .thenReturn(slice);

        // when
        QuestionLibraryResponse response = libraryService.getQuestionLibrary(
                userId, category, size, Optional.empty());

        // then
        assertThat(response.qnAs()).hasSize(3);

        assertThat(response.qnAs().get(0).question()).isEqualTo("최신 질문");
        assertThat(response.qnAs().get(1).question()).isEqualTo("중간 질문");
        assertThat(response.qnAs().get(2).question()).isEqualTo("옛날 질문");

        assertThat(response.qnAs().get(0).id()).isEqualTo(3L);
        assertThat(response.qnAs().get(2).id()).isEqualTo(1L);
    }

    private CoverLetter createMockCoverLetter(Long id, String userId, String companyName, LocalDate deadline) {
        CoverLetter coverLetter = CoverLetter.from(
                userId,
                new CreateCoverLetterRequest(
                        companyName,
                        2024,
                        ApplyHalfType.FIRST_HALF,
                        "백엔드 개발자",
                        deadline,
                        List.of()
                )
        );
        ReflectionTestUtils.setField(coverLetter, "id", id);
        return coverLetter;
    }

    private QnA createMockQnA(Long id, CoverLetter coverLetter, String category, String question, String answer) {
        CreateQuestionRequest request = new CreateQuestionRequest(question, category);

        QnA qna = QnA.newQnA(coverLetter, request);

        ReflectionTestUtils.setField(qna, "id", id);

        ReflectionTestUtils.setField(qna, "answer", answer);

        return qna;
    }


}