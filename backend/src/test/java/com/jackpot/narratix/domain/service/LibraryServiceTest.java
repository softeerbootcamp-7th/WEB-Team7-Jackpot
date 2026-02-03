package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.GetLibraryListRequest;
import com.jackpot.narratix.domain.entity.enums.LibraryType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.exception.LibraryErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.global.exception.BaseException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.BDDMockito.given;
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
        GetLibraryListRequest request = new GetLibraryListRequest(LibraryType.COMPANY);

        List<String> expectedCompanies = List.of("삼성전자", "네이버", "카카오");

        given(coverLetterRepository.findCompanyNamesByUserId(userId))
                .willReturn(expectedCompanies);

        // when
        List<String> result = libraryService.getLibraryList(userId, request);

        // then
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly("삼성전자", "네이버", "카카오");

        verify(coverLetterRepository).findCompanyNamesByUserId(userId);
    }

    @Test
    @DisplayName("문항유형 라이브러리 조회 성공 - Enum이 한글 설명으로 변환되어 반환")
    void getLibraryList_Question() {
        // given
        GetLibraryListRequest request = new GetLibraryListRequest(LibraryType.QUESTION);

        List<QuestionCategoryType> enumList = List.of(
                QuestionCategoryType.MOTIVATION,
                QuestionCategoryType.GROWTH_PROCESS
        );

        given(qnARepository.findQuestionCategoryByUserId(userId))
                .willReturn(enumList);

        // when
        List<String> result = libraryService.getLibraryList(userId, request);

        // then
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly("지원동기", "성장과정");

        verify(qnARepository).findQuestionCategoryByUserId(userId);
    }

    @Test
    @DisplayName("데이터가 없을 때 - 빈 리스트를 반환해야 함 (에러 X)")
    void getLibraryList_Empty() {
        // given
        GetLibraryListRequest request = new GetLibraryListRequest(LibraryType.COMPANY);

        given(coverLetterRepository.findCompanyNamesByUserId(userId))
                .willReturn(List.of());

        // when
        List<String> result = libraryService.getLibraryList(userId, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("문항유형 데이터가 없을 때 - 빈 리스트를 반환해야 함")
    void getLibraryList_Question_Empty() {
        // given
        GetLibraryListRequest request = new GetLibraryListRequest(LibraryType.QUESTION);

        given(qnARepository.findQuestionCategoryByUserId(userId))
                .willReturn(List.of());

        // when
        List<String> result = libraryService.getLibraryList(userId, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("요청 타입이 NULL일 때 - 예외가 발생해야 함")
    void getLibraryList_NullType() {
        // given
        // type이 null인 잘못된 요청 생성
        GetLibraryListRequest request = new GetLibraryListRequest(null);

        // when & then
        assertThatThrownBy(() -> libraryService.getLibraryList(userId, request))
                .isInstanceOf(BaseException.class)
                .extracting("errorCode")
                .isEqualTo(LibraryErrorCode.INVALID_LIBRARY_TYPE);
    }
}