package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.Scrap;
import com.jackpot.narratix.domain.entity.ScrapId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ScrapJpaRepository extends JpaRepository<Scrap, ScrapId> {

    @Query("SELECT COUNT(s) FROM Scrap s WHERE s.id.userId = :userId")
    Long countByUserId(String userId);

    boolean existsById(ScrapId scrapId);

}
