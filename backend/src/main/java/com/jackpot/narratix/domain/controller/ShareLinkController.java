package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.api.ShareLinkApi;
import com.jackpot.narratix.domain.controller.request.ShareLinkActiveRequest;
import com.jackpot.narratix.domain.controller.response.CoverLetterAndQnAIdsResponse;
import com.jackpot.narratix.domain.controller.response.QnAVersionResponse;
import com.jackpot.narratix.domain.controller.response.ShareLinkActiveResponse;
import com.jackpot.narratix.domain.service.ShareLinkService;
import com.jackpot.narratix.global.auth.UserId;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ShareLinkController implements ShareLinkApi {

    private final ShareLinkService shareLinkService;

    @Override
    @PatchMapping("/coverletter/{coverLetterId}/share-link")
    public ResponseEntity<ShareLinkActiveResponse> updateShareLinkStatus(
            @UserId String userId,
            @PathVariable Long coverLetterId,
            @Valid @RequestBody ShareLinkActiveRequest request
    ) {
        return ResponseEntity.ok(shareLinkService.updateShareLinkStatus(userId, coverLetterId, request.active()));
    }

    @Override
    @GetMapping("/coverletter/{coverLetterId}/share-link")
    public ResponseEntity<ShareLinkActiveResponse> getShareLinkStatus(
            @UserId String userId,
            @PathVariable Long coverLetterId
    ) {
        return ResponseEntity.ok(shareLinkService.getShareLinkStatus(userId, coverLetterId));
    }

    @Override
    @GetMapping("/share/{shareId}/qna/{qnAId}")
    public ResponseEntity<QnAVersionResponse> getQnAWithVersion(
            @UserId String userId,
            @PathVariable String shareId,
            @PathVariable Long qnAId
    ) {
        return ResponseEntity.ok(shareLinkService.getQnAWithVersion(userId, shareId, qnAId));
    }
}
