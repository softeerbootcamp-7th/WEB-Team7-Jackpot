package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.service.ReviewService;
import com.jackpot.narratix.global.auth.UserId;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/qna/{qnAId}/reviews")
    public ResponseEntity<Void> createReview(
            @UserId String userId,
            @PathVariable Long qnAId,
            @RequestBody @Valid ReviewCreateRequest request
    ) {
        reviewService.createReview(userId, qnAId, request);
        return ResponseEntity.noContent().build();
    }
}
