package com.jackpot.narratix.domain.service;


import com.jackpot.narratix.domain.exception.SearchErrorCode;
import com.jackpot.narratix.domain.repository.ScrapRepository;
import com.jackpot.narratix.global.exception.BaseException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private ScrapRepository scrapRepository;

    @InjectMocks
    private SearchService searchService;

    @Test
    @DisplayName("검색어가 1글자면 INVALID_SEARCH_KEYWORD 예외가 발생한다")
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
                    assert baseException.getErrorCode() == SearchErrorCode.INVALID_SEARCH_KEYWORD;
                });
        verifyNoInteractions(scrapRepository);
    }

    @Test
    @DisplayName("검색어가 공백 포함 1글자면(trim 후) INVALID_SEARCH_KEYWORD 예외가 발생한다")
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
                    assert baseException.getErrorCode() == SearchErrorCode.INVALID_SEARCH_KEYWORD;
                });
        verifyNoInteractions(scrapRepository);
    }

}