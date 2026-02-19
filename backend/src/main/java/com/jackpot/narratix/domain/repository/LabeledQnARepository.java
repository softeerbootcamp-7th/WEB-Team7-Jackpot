package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.LabeledQnA;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabeledQnARepository extends JpaRepository<LabeledQnA, String> {
}
