package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.SearchScrapResponse;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.repository.ScrapRepository;
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

        Slice<QnA> qnas;
        if (!hasKeyword) {
            if (lastQnaId != null) qnas = scrapRepository.findScrapsNext(userId, lastQnaId, size);
            else qnas = scrapRepository.findScraps(userId, size);
        } else {
            if (lastQnaId != null) qnas = scrapRepository.searchQnAInScrapsNext(userId, searchWord, lastQnaId, size);
            else qnas = scrapRepository.searchQnAInScraps(userId, searchWord, size);
        }

        return SearchScrapResponse.of(qnas.getContent(), qnas.hasNext());
    }
}
