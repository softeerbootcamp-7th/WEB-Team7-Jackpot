package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.api.CoverLetterApi;
import com.jackpot.narratix.domain.controller.request.CoverLetterFilterRequest;
import com.jackpot.narratix.domain.controller.response.FilteredCoverLettersResponse;
import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.request.CoverLetterAndQnAEditRequest;
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
public class CoverLetterController implements CoverLetterApi {

    private final CoverLetterService coverLetterService;

    @Override
    @PostMapping
    public ResponseEntity<CreateCoverLetterResponse> createCoverLetter(
            @UserId String userId,
            @RequestBody @Valid CreateCoverLetterRequest createCoverLetterRequest
    ) {
        return ResponseEntity.ok(coverLetterService.createNewCoverLetter(userId, createCoverLetterRequest));
    }

    @Override
    @PutMapping
    public ResponseEntity<Void> editCoverLetter(
            @UserId String userId,
            @RequestBody @Valid CoverLetterAndQnAEditRequest coverLetterAndQnAEditRequest
    ) {
        coverLetterService.editCoverLetter(userId, coverLetterAndQnAEditRequest);
        return ResponseEntity.noContent().build();
    }

    @Override
    @GetMapping("/{coverLetterId}")
    public ResponseEntity<CoverLetterResponse> findCoverLetterById(
            @UserId String userId,
            @PathVariable Long coverLetterId
    ) {
        return ResponseEntity.ok(coverLetterService.findCoverLetterById(userId, coverLetterId));
    }

    @Override
    @DeleteMapping("/{coverLetterId}")
    public ResponseEntity<Void> deleteCoverLetterById(
            @UserId String userId,
            @PathVariable Long coverLetterId
    ) {
        coverLetterService.deleteCoverLetterById(userId, coverLetterId);
        return ResponseEntity.noContent().build();
    }

    @Override
    @GetMapping("/count")
    public ResponseEntity<TotalCoverLetterCountResponse> getTotalCoverLetterCount(
            @UserId String userId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date
    ) {
        return ResponseEntity.ok(coverLetterService.getTotalCoverLetterCount(userId, date));
    }

    @Override
    @GetMapping("/all")
    public ResponseEntity<FilteredCoverLettersResponse> getAllCoverLetterByFilter(
            @UserId String userId,
            @Valid @ModelAttribute CoverLetterFilterRequest request
            ) {
        return ResponseEntity.ok(coverLetterService.getAllCoverLetterByFilter(userId, request));
    }

    @Override
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

    @Override
    @GetMapping("/calendar")
    public ResponseEntity<List<LocalDate>> findDeadlineByDateRange(
            @UserId String userId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate
    ) {
        return ResponseEntity.ok(coverLetterService.findDeadlineByDateRange(userId, startDate, endDate));
    }
}
