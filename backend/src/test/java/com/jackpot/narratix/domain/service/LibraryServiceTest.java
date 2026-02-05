package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.CompanyLibraryResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

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
    @DisplayName("기업별 자소서 조회 - 첫 페이지 (lastId가 Null)일 때, 3개 인자 메서드가 호출")
    void getCompanyLibraries_FirstPage() {
        // given
        String userId = "user1";
        String companyName = "Samsung";
        int size = 10;
        Long lastCoverLetterId = null;

        CoverLetter resultMock = mock(CoverLetter.class);
        given(resultMock.getApplyHalf()).willReturn(ApplyHalfType.FIRST_HALF);
        given(resultMock.getId()).willReturn(1L);

        List<CoverLetter> content = List.of(resultMock);
        Slice<CoverLetter> slice = new SliceImpl<>(content, PageRequest.of(0, size), true);

        given(coverLetterRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                eq(userId), eq(companyName), any(Pageable.class))
        ).willReturn(slice);

        // when
        CompanyLibraryResponse response = libraryService.getCompanyLibraries(userId, companyName, size, lastCoverLetterId);

        // then
        assertThat(response.coverLetters()).hasSize(1); // Mock 1개를 넣었으므로 사이즈 1
        assertThat(response.hasNext()).isTrue();

        verify(coverLetterRepository).findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                eq(userId), eq(companyName), any(Pageable.class)
        );
    }

    @Test
    @DisplayName("기업별 자소서 조회 - 다음 페이지 (lastId가 있음)일 때, ID조회 후 4개 인자 메서드가 호출")
    void getCompanyLibraries_NextPage() {
        // given
        String userId = "user1";
        String companyName = "Samsung";
        int size = 10;
        Long lastId = 100L;

        LocalDateTime mockDateTime = LocalDateTime.of(2024, 2, 4, 12, 0, 0);

        CoverLetter mockLastCoverLetter = mock(CoverLetter.class);
        given(mockLastCoverLetter.getModifiedAt()).willReturn(mockDateTime);
        given(coverLetterRepository.findByIdOrElseThrow(lastId)).willReturn(mockLastCoverLetter);

        CoverLetter resultMock = mock(CoverLetter.class);
        given(resultMock.getApplyHalf()).willReturn(ApplyHalfType.FIRST_HALF);
        given(resultMock.getId()).willReturn(200L);

        List<CoverLetter> content = List.of(resultMock);
        Slice<CoverLetter> slice = new SliceImpl<>(content, PageRequest.of(0, size), false);

        given(coverLetterRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                eq(userId), eq(companyName), any(LocalDateTime.class), any(Pageable.class))
        ).willReturn(slice);

        // when
        CompanyLibraryResponse response = libraryService.getCompanyLibraries(userId, companyName, size, lastId);

        // then
        assertThat(response.coverLetters()).hasSize(1);
        assertThat(response.hasNext()).isFalse();

        verify(coverLetterRepository).findByIdOrElseThrow(lastId);

        verify(coverLetterRepository).findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                eq(userId),
                eq(companyName),
                eq(LocalDateTime.from(mockDateTime)),
                any(Pageable.class)
        );
    }
}