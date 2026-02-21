package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.request.CreateScrapRequest;
import com.jackpot.narratix.domain.controller.response.CreateScrapResponse;
import com.jackpot.narratix.domain.service.ScrapService;
import com.jackpot.narratix.global.auth.UserId;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/scraps")
public class ScrapController {

    private final ScrapService scrapService;

    @PostMapping
    public ResponseEntity<CreateScrapResponse> createScrap(
            @UserId String userId,
            @RequestBody @Valid CreateScrapRequest request
    ) {
        return ResponseEntity.ok(scrapService.createScrap(userId, request));
    }
}
