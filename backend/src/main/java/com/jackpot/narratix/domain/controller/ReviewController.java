package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.api.ReviewApi;
import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.response.ReviewsGetResponse;
import com.jackpot.narratix.domain.service.ReviewFacade;
import com.jackpot.narratix.global.auth.UserId;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ReviewController implements ReviewApi {

    private final ReviewFacade reviewFacade;

    @Override
    @PostMapping("/qna/{qnAId}/reviews")
    public ResponseEntity<Void> createReview(
            @UserId String userId,
            @PathVariable Long qnAId,
            @RequestBody @Valid ReviewCreateRequest request
    ) {
        reviewFacade.createReview(userId, qnAId, request);
        return ResponseEntity.noContent().build();
    }

    @Override
    @PutMapping("/qna/{qnAId}/reviews/{reviewId}")
    public ResponseEntity<Void> editReview(
            @UserId String userId,
            @PathVariable Long qnAId,
            @PathVariable Long reviewId,
            @RequestBody ReviewEditRequest request
    ) {
        reviewFacade.editReview(userId, qnAId, reviewId, request);
        return ResponseEntity.noContent().build();
    }

    @Override
    @DeleteMapping("/qna/{qnAId}/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @UserId String userId,
            @PathVariable Long qnAId,
            @PathVariable Long reviewId
    ) {
        reviewFacade.deleteReview(userId, qnAId, reviewId);
        return ResponseEntity.noContent().build();
    }

    @Override
    @PatchMapping("/qna/{qnAId}/reviews/{reviewId}/approve")
    public ResponseEntity<Void> approveReview(
            @UserId String userId,
            @PathVariable Long qnAId,
            @PathVariable Long reviewId
    ) {
        reviewFacade.approveReview(userId, qnAId, reviewId);
        return ResponseEntity.noContent().build();
    }

    @Override
    @GetMapping("/qna/{qnAId}/reviews/all")
    public ResponseEntity<ReviewsGetResponse> getAllReviews(
            @UserId String userId,
            @PathVariable Long qnAId
    ) {
        return ResponseEntity.ok(reviewFacade.getAllReviews(userId, qnAId));
    }
}
