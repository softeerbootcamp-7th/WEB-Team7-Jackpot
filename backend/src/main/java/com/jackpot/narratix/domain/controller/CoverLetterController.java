package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.request.EditCoverLetterRequest;
import com.jackpot.narratix.domain.controller.response.CoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.TotalCoverLetterCountResponse;
import com.jackpot.narratix.domain.controller.response.UpcomingCoverLetterResponse;
import com.jackpot.narratix.domain.service.CoverLetterService;
import com.jackpot.narratix.global.auth.UserId;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

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

    @PutMapping
    public ResponseEntity<Void> editCoverLetter(
            @UserId String userId,
            @RequestBody @Valid EditCoverLetterRequest editCoverLetterRequest
    ) {
        coverLetterService.editCoverLetter(userId, editCoverLetterRequest);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<CoverLetterResponse> findCoverLetterById(
            @UserId String userId,
            @RequestParam Long coverLetterId
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

    @GetMapping("/upcoming")
    public ResponseEntity<List<UpcomingCoverLetterResponse>> getUpcomingCoverLetters(
            @UserId String userId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date,
            @RequestParam Integer maxDeadLineSize,
            @RequestParam Integer maxCoverLetterSizePerDeadLine
    ) {
        return ResponseEntity.ok(
                coverLetterService.getUpcomingCoverLetters(userId, date, maxDeadLineSize, maxCoverLetterSizePerDeadLine)
        );
    }
}
