package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Scrap;
import com.jackpot.narratix.domain.entity.ScrapId;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ScrapRepositoryImpl implements ScrapRepository {

    private final ScrapJpaRepository scrapJpaRepository;

    @Override
    public Scrap save(Scrap scrap) {
        return scrapJpaRepository.save(scrap);
    }

    @Override
    public Long countByUserId(String userId) {
        return scrapJpaRepository.countByUserId(userId);
    }

    @Override
    public boolean existsById(ScrapId scrapId) {
        return scrapJpaRepository.existsById(scrapId);
    }

    @Override
    public void deleteById(ScrapId scrapId) {
        scrapJpaRepository.deleteById(scrapId);
    }

    @Override
    public Slice<QnA> searchQnAInScraps(String userId, String searchWord, Integer limit) {
        Pageable pageable = PageRequest.ofSize(limit);
        return scrapJpaRepository.searchQnAInScraps(userId, searchWord, pageable);
    }

    @Override
    public Slice<QnA> searchQnAInScrapsNext(String userId, String searchWord, Long lastQnaId, Integer limit) {
        Pageable pageable = PageRequest.ofSize(limit);
        return scrapJpaRepository.searchQnAInScrapsNext(userId, searchWord, lastQnaId, pageable);
    }

    @Override
    public Slice<QnA> findScraps(String userId, Integer limit) {
        Pageable pageable = PageRequest.ofSize(limit);
        return scrapJpaRepository.findScraps(userId, pageable);
    }

    @Override
    public Slice<QnA> findScrapsNext(String userId, Long lastQnaId, Integer limit) {
        Pageable pageable = PageRequest.ofSize(limit);
        return scrapJpaRepository.findScrapsNext(userId, lastQnaId, pageable);
    }

}

