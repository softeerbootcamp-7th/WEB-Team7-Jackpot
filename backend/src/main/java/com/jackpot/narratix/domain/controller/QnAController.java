package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.service.CoverLetterService;
import com.jackpot.narratix.global.auth.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/qna")
public class QnAController {

    private final CoverLetterService coverLetterService;

    @GetMapping("/id/all")
    public ResponseEntity<List<Long>> getQnAIdsByCoverLetterId(
            @UserId String userId,
            @RequestParam Long coverLetterId
    ) {
        return ResponseEntity.ok(coverLetterService.getQnAIdsByCoverLetterId(userId, coverLetterId));
    }
}
