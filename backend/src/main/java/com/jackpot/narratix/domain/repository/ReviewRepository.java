package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.exception.ReviewErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    default Review findByIdOrElseThrow(Long reviewId){
        return this.findById(reviewId).orElseThrow(() -> new BaseException(ReviewErrorCode.REVIEW_NOT_FOUND));
    }

    List<Review> findAllByQnaId(Long qnAId);

    List<Review> findAllByQnaIdAndReviewerId(Long qnAId, String userId);
}