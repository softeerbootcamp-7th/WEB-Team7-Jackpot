package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.SearchCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.SearchScrapResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.exception.SearchErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.ScrapRepository;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ScrapRepository scrapRepository;
    private final CoverLetterRepository coverLetterRepository;

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

    @Transactional(readOnly = true)
    public SearchCoverLetterResponse searchCoverLetter(
            String userId, String searchWord, Integer size, Integer page
    ) {
        String keyword = StringUtils.hasText(searchWord) ? searchWord.trim() : null;
        if (keyword != null && keyword.length() < 2) {
            throw new BaseException(SearchErrorCode.INVALID_SEARCH_KEYWORD);
        }

        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size);

        Page<CoverLetter> resultPage = coverLetterRepository.searchCoverLetters(userId, keyword, pageable);

        return SearchCoverLetterResponse.from(resultPage);
    }

}


