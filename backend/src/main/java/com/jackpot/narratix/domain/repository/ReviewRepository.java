package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {


}