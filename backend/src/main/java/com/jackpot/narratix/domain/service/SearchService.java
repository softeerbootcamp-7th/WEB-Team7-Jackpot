package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.SearchScrapResponse;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.repository.ScrapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ScrapRepository scrapRepository;

    public SearchScrapResponse searchScrap(String userId, String searchWord, Integer size, Long lastQnaId) {

        Pageable pageable = PageRequest.of(0, size);

        Slice<QnA> qnaSlice = scrapRepository.searchScrapsByKeyword(userId, searchWord, lastQnaId, pageable);

        List<SearchScrapResponse.QnAItem> qnaItems = qnaSlice.getContent().stream()
                .map(SearchScrapResponse.QnAItem::from)
                .toList();

        return SearchScrapResponse.of(qnaItems, qnaSlice.hasNext());
    }
}
