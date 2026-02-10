package com.jackpot.narratix.domain.service;


import com.jackpot.narratix.domain.controller.response.SearchCoverLetterResponse;
import com.jackpot.narratix.domain.exception.SearchErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
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

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
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
}

