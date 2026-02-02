package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class CoverLetterRepositoryImpl implements CoverLetterRepository{

    private final CoverLetterJpaRepository coverLetterJpaRepository;

    @Override
    public CoverLetter save(CoverLetter coverLetter) {
        return coverLetterJpaRepository.save(coverLetter);
    }
}
