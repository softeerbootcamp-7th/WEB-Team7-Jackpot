package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CoverLetterJpaRepository extends JpaRepository<CoverLetter, Long> {
    Integer countByUserId(String userId);

    List<CoverLetter> user(User user);

    Integer countByUserIdAndApplyYearAndApplyHalf(String userId, int applyYear, ApplyHalfType applyHalf);
}
