package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.response.CoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.TotalCoverLetterCountResponse;
import com.jackpot.narratix.domain.service.CoverLetterService;
import com.jackpot.narratix.global.auth.UserId;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/coverletter")
public class CoverLetterController {

    private final CoverLetterService coverLetterService;

    @PostMapping
    public ResponseEntity<CreateCoverLetterResponse> createCoverLetter(
            @UserId String userId,
            @RequestBody @Valid CreateCoverLetterRequest createCoverLetterRequest
    ) {
        return ResponseEntity.ok(coverLetterService.createNewCoverLetter(userId, createCoverLetterRequest));
    }

    @GetMapping
    public ResponseEntity<CoverLetterResponse> findCoverLetterById(
            @UserId String userId,
            @RequestParam @Valid @NotNull Long coverLetterId
    ) {
        return ResponseEntity.ok(coverLetterService.findCoverLetterById(userId, coverLetterId));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteCoverLetterById(
            @UserId String userId,
            @RequestParam Long coverLetterId
    ) {
        coverLetterService.deleteCoverLetterById(userId, coverLetterId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<TotalCoverLetterCountResponse> getTotalCoverLetterCount(
            @UserId String userId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date
    ) {
        return ResponseEntity.ok(coverLetterService.getTotalCoverLetterCount(userId, date));
    }
}
