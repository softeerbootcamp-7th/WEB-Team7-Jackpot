package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.CreateScrapRequest;
import com.jackpot.narratix.domain.controller.response.CreateScrapResponse;
import com.jackpot.narratix.domain.controller.response.ScrapCountResponse;
import com.jackpot.narratix.domain.entity.Scrap;
import com.jackpot.narratix.domain.entity.ScrapId;
import com.jackpot.narratix.domain.exception.ScrapErrorCode;
import com.jackpot.narratix.domain.repository.ScrapRepository;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class ScrapService {

    private final ScrapRepository scrapRepository;

    @Transactional
    public CreateScrapResponse createScrap(String userId, CreateScrapRequest request) {
        ScrapId scrapId = new ScrapId(userId, request.qnaId());
        if (isIdDuplicated(scrapId)) {
            throw new BaseException(ScrapErrorCode.DUPLICATE_SCRAP);
        }
        Scrap scrap = Scrap.of(userId, request.qnaId());
        scrapRepository.save(scrap);

        return new CreateScrapResponse(scrap.getId().getQnaId(), scrapRepository.countByUserId(userId));
    }

    private boolean isIdDuplicated(ScrapId scrapId) {
        return scrapRepository.existsById(scrapId);
    }

    public ScrapCountResponse getScrapCount(String userId) {
        return new ScrapCountResponse(scrapRepository.countByUserId(userId));
    }
}
