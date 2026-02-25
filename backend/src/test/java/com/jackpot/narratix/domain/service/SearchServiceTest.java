package com.jackpot.narratix.domain.service;


import com.jackpot.narratix.domain.controller.response.SearchCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.SearchLibraryAndQnAResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.exception.SearchErrorCode;
import com.jackpot.narratix.domain.fixture.CoverLetterFixture;
import com.jackpot.narratix.domain.fixture.QnAFixture;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ScrapRepository;
import com.jackpot.narratix.global.exception.BaseException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private ScrapRepository scrapRepository;

    @Mock
    private CoverLetterRepository coverLetterRepository;

    @Mock
    private QnARepository qnARepository;

    @InjectMocks
    private SearchService searchService;

    @Test
    @DisplayName("스크랩 내 검색 : 검색어가 1글자면 INVALID_SEARCH_KEYWORD 예외가 발생한다")
    void searchScrap_invalidKeyword_throwsException() {
        // given
        String userId = "user-1";
        String searchWord = "a";
        Integer size = 10;
        Long lastQnaId = null;

        // when & then
        assertThatThrownBy(() ->
                searchService.searchScrap(userId, searchWord, size, lastQnaId)
        )
                .isInstanceOf(BaseException.class)
                .satisfies(ex -> {
                    BaseException baseException = (BaseException) ex;
                    assertThat(baseException.getErrorCode())
                            .isEqualTo(SearchErrorCode.INVALID_SEARCH_KEYWORD);
                });
        verifyNoInteractions(scrapRepository);
    }

    @Test
    @DisplayName("스크랩 내 검색 :검색어가 공백 포함 1글자면(trim 후) INVALID_SEARCH_KEYWORD 예외가 발생한다")
    void searchScrap_invalidKeywordWithSpaces_throwsException() {
        // given
        String userId = "user-1";
        String searchWord = " a ";
        Integer size = 10;
        Long lastQnaId = null;

        // when & then
        assertThatThrownBy(() ->
                searchService.searchScrap(userId, searchWord, size, lastQnaId)
        )
                .isInstanceOf(BaseException.class)
                .satisfies(ex -> {
                    BaseException baseException = (BaseException) ex;
                    assertThat(baseException.getErrorCode())
                            .isEqualTo(SearchErrorCode.INVALID_SEARCH_KEYWORD);
                });
        verifyNoInteractions(scrapRepository);
    }

    @Test
    @DisplayName("자소서 전체 내 검색: 검색어가 1글자면 예외가 발생한다")
    void searchCoverLetter_invalidKeyword_throwsException() {
        // given
        String userId = "user-1";
        String searchWord = "a";
        Integer size = 10;
        Integer page = 1;

        // when & then
        assertThatThrownBy(() ->
                searchService.searchCoverLetter(userId, searchWord, size, page)
        )
                .isInstanceOf(BaseException.class)
                .satisfies(ex -> {
                    BaseException baseException = (BaseException) ex;
                    assertThat(baseException.getErrorCode())
                            .isEqualTo(SearchErrorCode.INVALID_SEARCH_KEYWORD);
                });
        verifyNoInteractions(coverLetterRepository);
    }

    @Test
    @DisplayName("자소서 전체 내 검색: 검색어가 공백 포함 1글자면(trim 후) 예외가 발생한다")
    void searchCoverLetter_invalidKeywordWithSpaces_throwsException() {
        // given
        String userId = "user-1";
        String searchWord = " a ";
        Integer size = 10;
        Integer page = 1;

        // when & then
        assertThatThrownBy(() ->
                searchService.searchCoverLetter(userId, searchWord, size, page)
        )
                .isInstanceOf(BaseException.class)
                .satisfies(ex -> {
                    BaseException baseException = (BaseException) ex;
                    assertThat(baseException.getErrorCode())
                            .isEqualTo(SearchErrorCode.INVALID_SEARCH_KEYWORD);
                });
        verifyNoInteractions(coverLetterRepository);
    }

    @Test
    @DisplayName("자소서 검색: 유효한 검색어로 정상 조회된다")
    void searchCoverLetter_validKeyword_returnsResponse() {
        // given
        String userId = "user-1";
        String searchWord = " 삼성 "; // 공백 포함
        Integer size = 10;
        Integer page = 1;

        given(coverLetterRepository.searchCoverLetters(any(), any(), any()))
                .willReturn(Page.empty());

        // when
        SearchCoverLetterResponse response = searchService.searchCoverLetter(userId, searchWord, size, page);

        // then
        assertThat(response).isNotNull();

        verify(coverLetterRepository).searchCoverLetters(eq(userId), eq("삼성"), any(Pageable.class));
    }

    @Test
    @DisplayName("자소서 검색: 검색어가 없으면 전체 조회(null 전달)가 수행된다")
    void searchCoverLetter_noKeyword_returnsAll() {
        // given
        String userId = "user-1";
        String searchWord = null;
        Integer size = 10;
        Integer page = 1;

        given(coverLetterRepository.searchCoverLetters(any(), any(), any()))
                .willReturn(Page.empty());

        // when
        searchService.searchCoverLetter(userId, searchWord, size, page);

        // then
        verify(coverLetterRepository).searchCoverLetters(eq(userId), eq(null), any(Pageable.class));
    }

    @Test
    @DisplayName("라이브러리 내 검색: 검색어가 공백 / null 이면 예외가 발생한다")
    void searchLibraryAndQnA_invalidKeyword_throwsException() {
        // given
        String userId = "user-1";
        Integer size = 10;
        Long lastQnAId = null;

        // 1. 공백 문자열 케이스 ("   ")
        String emptyWord = "   ";

        // when & then
        assertThatThrownBy(() ->
                searchService.searchLibraryAndQnA(userId, emptyWord, size, lastQnAId)
        )
                .isInstanceOf(BaseException.class)
                .satisfies(ex -> {
                    BaseException baseException = (BaseException) ex;
                    assertThat(baseException.getErrorCode())
                            .isEqualTo(SearchErrorCode.INVALID_SEARCH_KEYWORD);
                });

        // 2. Null 케이스
        assertThatThrownBy(() ->
                searchService.searchLibraryAndQnA(userId, null, size, lastQnAId)
        )
                .isInstanceOf(BaseException.class)
                .satisfies(ex -> {
                    BaseException baseException = (BaseException) ex;
                    assertThat(baseException.getErrorCode())
                            .isEqualTo(SearchErrorCode.INVALID_SEARCH_KEYWORD);
                });

        verifyNoInteractions(qnARepository);
    }

    @Test
    @DisplayName("문항 검색: 유효한 검색어로 정상 조회된다 (검색어 trim 및 와일드카드 적용 확인)")
    void searchLibraryAndQnA_validKeyword_returnsResponse() {
        String userId = "user-1";
        String searchWord = "  도전  ";
        String trimmedKeyword = "도전";
        String keywordWithWildcard = "도전*";
        Integer size = 10;
        Long lastQnAId = null;

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .userId(userId)
                .companyName("테스트 기업")
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .build();

        QnA qna1 = QnAFixture.createQnA(coverLetter, userId, "도전적인 경험 질문", QuestionCategoryType.MOTIVATION);
        QnA qna2 = QnAFixture.createQnA(coverLetter, userId, "실패 극복 질문", QuestionCategoryType.FAILURE_EXPERIENCE);

        List<QnA> qnaList = List.of(qna1, qna2);
        Slice<QnA> qnaSlice = new SliceImpl<>(qnaList);

        List<QuestionCategoryType> mockCategories = List.of(QuestionCategoryType.MOTIVATION, QuestionCategoryType.FAILURE_EXPERIENCE);
        Long mockCount = 5L;

        given(qnARepository.searchQuestionCategory(userId, trimmedKeyword))
                .willReturn(mockCategories);

        given(qnARepository.searchQnA(eq(userId), eq(keywordWithWildcard), eq(size), eq(lastQnAId)))
                .willReturn(qnaSlice);

        given(qnARepository.countSearchQnA(eq(userId), eq(keywordWithWildcard)))
                .willReturn(mockCount);

        // when
        SearchLibraryAndQnAResponse response = searchService.searchLibraryAndQnA(userId, searchWord, size, lastQnAId);

        // then
        assertThat(response).isNotNull();
        List<String> expectedDescriptions = mockCategories.stream()
                .map(QuestionCategoryType::getDescription)
                .toList();
        assertThat(response.libraries()).isEqualTo(expectedDescriptions);
        assertThat(response.qnACount()).isEqualTo(mockCount);

        assertThat(response.qnAs()).hasSize(2);

        assertThat(response.qnAs().get(0).companyName()).isEqualTo("테스트 기업");
        assertThat(response.qnAs().get(0).question()).isEqualTo("도전적인 경험 질문");

        // verify
        verify(qnARepository).searchQuestionCategory(userId, trimmedKeyword);
        verify(qnARepository).searchQnA(userId, keywordWithWildcard, size, lastQnAId);
        verify(qnARepository).countSearchQnA(userId, keywordWithWildcard);
    }
}


