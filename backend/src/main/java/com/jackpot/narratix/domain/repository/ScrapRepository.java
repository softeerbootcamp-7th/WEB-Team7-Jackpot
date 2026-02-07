package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.Scrap;
import com.jackpot.narratix.domain.entity.ScrapId;

public interface ScrapRepository {
    Scrap save(Scrap scrap);

    Long countByUserId(String userId);

    boolean existsById(ScrapId scrapId);
}
