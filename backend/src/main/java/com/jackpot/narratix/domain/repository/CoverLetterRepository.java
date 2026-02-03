package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;

import java.util.Optional;

public interface CoverLetterRepository {

    CoverLetter save(CoverLetter coverLetter);

    Optional<CoverLetter> findById(Long id);
}
