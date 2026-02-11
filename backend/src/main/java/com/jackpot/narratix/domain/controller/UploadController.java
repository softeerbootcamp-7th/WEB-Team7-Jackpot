package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.api.UploadApi;
import com.jackpot.narratix.domain.controller.request.PresignedUrlRequest;
import com.jackpot.narratix.domain.controller.response.PresignedUrlResponse;
import com.jackpot.narratix.domain.service.UploadService;
import com.jackpot.narratix.global.auth.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/upload")
public class UploadController implements UploadApi {

    private final UploadService uploadService;

    @Override
    @PostMapping("/presignedurl")
    public ResponseEntity<PresignedUrlResponse> createPresignedUrl(
            @UserId String userId,
            @RequestBody PresignedUrlRequest request

    ) {
        return ResponseEntity.ok(uploadService.createPresignedUrl(userId, request));
    }

}
