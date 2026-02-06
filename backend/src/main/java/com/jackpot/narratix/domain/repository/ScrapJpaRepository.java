package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.Scrap;
import com.jackpot.narratix.domain.entity.ScrapId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScrapJpaRepository extends JpaRepository<Scrap, Long> {

    Long countById_UserId(String userId);

    boolean existsById(ScrapId scrapId);
}
