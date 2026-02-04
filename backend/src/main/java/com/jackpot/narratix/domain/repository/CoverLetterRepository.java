package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;

import java.util.List;
import java.util.Optional;

public interface CoverLetterRepository {

    CoverLetter save(CoverLetter coverLetter);

    Integer countByUserId(String userId);

    Integer countByUserIdAndApplyYearAndApplyHalf(String userId, int applyYear, ApplyHalfType applyHalf);

    Optional<CoverLetter> findById(Long coverLetterId);

    void deleteById(Long coverLetterId);

    CoverLetter findByIdOrElseThrow(Long coverLetterId);
  
    List<String> findCompanyNamesByUserId(String userId);
}
