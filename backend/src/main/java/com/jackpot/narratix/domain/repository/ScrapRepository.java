package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Scrap;
import com.jackpot.narratix.domain.entity.ScrapId;
import org.springframework.data.domain.Slice;

public interface ScrapRepository {
    Scrap save(Scrap scrap);

    Long countByUserId(String userId);

    boolean existsById(String userId, Long qnAId);

    void deleteById(ScrapId scrapId);

    Slice<QnA> searchQnAInScrapsNext(String userId, String searchWord, Long lastQnaId, Integer limit);

    Slice<QnA> searchQnAInScraps(String userId, String searchWord, Integer limit);

    Slice<QnA> findScrapsNext(String userId, Long lastQnaId, Integer limit);

    Slice<QnA> findScraps(String userId, Integer limit);

}
