package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import org.springframework.stereotype.Repository;

@Repository
public interface CoverLetterRepository {

    CoverLetter save(CoverLetter coverLetter);
}
