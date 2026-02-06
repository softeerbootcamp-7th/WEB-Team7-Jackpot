package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.api.QnAApi;
import com.jackpot.narratix.domain.controller.response.QnAResponse;
import com.jackpot.narratix.domain.controller.request.QnAEditRequest;
import com.jackpot.narratix.domain.controller.response.QnAEditResponse;
import com.jackpot.narratix.domain.service.CoverLetterService;
import com.jackpot.narratix.global.auth.UserId;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/qna")
public class QnAController implements QnAApi {

    private final CoverLetterService coverLetterService;

    @Override
    public ResponseEntity<QnAEditResponse> editQnA(
            @UserId String userId,
            @RequestBody @Valid QnAEditRequest request
            ) {
        return ResponseEntity.ok(coverLetterService.editQnA(userId, request));
    }

    @Override
    public ResponseEntity<QnAResponse> getQnAById(
            @UserId String userId,
            @RequestParam Long qnaId
    ) {
        return ResponseEntity.ok(coverLetterService.getQnAById(userId, qnaId));
    }

    @Override
    public ResponseEntity<List<Long>> getQnAIdsByCoverLetterId(
            @UserId String userId,
            @RequestParam Long coverLetterId
    ) {
        return ResponseEntity.ok(coverLetterService.getQnAIdsByCoverLetterId(userId, coverLetterId));
    }
}