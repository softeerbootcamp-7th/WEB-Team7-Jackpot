package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.CreateScrapRequest;
import com.jackpot.narratix.domain.controller.response.CreateScrapResponse;
import com.jackpot.narratix.domain.controller.response.ScrapCountResponse;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Scrap;
import com.jackpot.narratix.domain.entity.ScrapId;
import com.jackpot.narratix.domain.exception.ScrapErrorCode;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ScrapRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class ScrapService {

    private final ScrapRepository scrapRepository;
    private final QnARepository qnARepository;

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

    @Transactional(readOnly = true)
    public ScrapCountResponse getScrapCount(String userId) {
        return new ScrapCountResponse(scrapRepository.countByUserId(userId));
    }

    @Transactional
    public ScrapCountResponse deleteScrapById(String userId, Long qnaId) {

        QnA qnA = qnARepository.findByIdOrElseThrow(qnaId);

        if (!qnA.isOwner(userId)) throw new BaseException(GlobalErrorCode.FORBIDDEN);

        ScrapId scrapId = new ScrapId(userId, qnaId);
        scrapRepository.deleteById(scrapId);

        return new ScrapCountResponse(scrapRepository.countByUserId(userId));
    }
}
