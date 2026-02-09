package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.SearchScrapResponse;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.exception.SearchErrorCode;
import com.jackpot.narratix.domain.repository.ScrapRepository;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ScrapRepository scrapRepository;

    public SearchScrapResponse searchScrap(
            String userId, String searchWord, Integer size, Long lastQnaId
    ) {
        boolean hasKeyword = StringUtils.hasText(searchWord);
        if (hasKeyword && searchWord.trim().length() < 2) {
            throw new BaseException(SearchErrorCode.INVALID_SEARCH_KEYWORD);
        }

        Slice<QnA> qnas = hasKeyword
                ? getSearchScraps(userId, searchWord.trim(), lastQnaId, size)
                : getAllScraps(userId, lastQnaId, size);

        return SearchScrapResponse.of(qnas.getContent(), qnas.hasNext());
    }

    private Slice<QnA> getAllScraps(String userId, Long lastQnaId, Integer size) {
        if (lastQnaId == null) {
            return scrapRepository.findScraps(userId, size);
        }
        return scrapRepository.findScrapsNext(userId, lastQnaId, size);
    }

    private Slice<QnA> getSearchScraps(String userId, String keyword, Long lastQnaId, Integer size) {
        if (lastQnaId == null) {
            return scrapRepository.searchQnAInScraps(userId, keyword, size);
        }
        return scrapRepository.searchQnAInScrapsNext(userId, keyword, lastQnaId, size);
    }

}


