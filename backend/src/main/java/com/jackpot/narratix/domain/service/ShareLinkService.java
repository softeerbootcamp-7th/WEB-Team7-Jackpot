package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.ShareLinkActiveResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.ShareLink;
import com.jackpot.narratix.domain.exception.ShareLinkErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.ShareLinkRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ShareLinkService {

    private final CoverLetterRepository coverLetterRepository;
    private final ShareLinkRepository shareLinkRepository;

    @Transactional
    public ShareLinkActiveResponse updateShareLinkStatus(String userId, Long coverLetterId, boolean active) {
        validateCoverLetterOwnership(userId, coverLetterId);

        if (active) {
            return activateShareLink(coverLetterId);
        } else {
            return deactivateShareLink(coverLetterId);
        }
    }

    private void validateCoverLetterOwnership(String userId, Long coverLetterId) {
        CoverLetter coverLetter = coverLetterRepository.findByIdOrElseThrow(coverLetterId);
        if (!coverLetter.isOwner(userId)) {
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    private ShareLinkActiveResponse activateShareLink(Long coverLetterId) {
        ShareLink shareLink = shareLinkRepository.findById(coverLetterId)
                .map(this::updateExistingShareLink)
                .orElseGet(() -> createNewShareLink(coverLetterId));
        return ShareLinkActiveResponse.activate(shareLink.getShareId());
    }

    private ShareLink updateExistingShareLink(ShareLink shareLink) {
        if (!shareLink.isShared()) shareLink.activate();
        return shareLink;
    }

    private ShareLink createNewShareLink(Long coverLetterId) {
        return shareLinkRepository.save(ShareLink.newActivatedShareLink(coverLetterId));
    }

    private ShareLinkActiveResponse deactivateShareLink(Long coverLetterId) {
        shareLinkRepository.findById(coverLetterId).ifPresent(ShareLink::deactivate);
        return ShareLinkActiveResponse.deactivate();
    }

    @Transactional(readOnly = true)
    public ShareLinkActiveResponse getShareLinkStatus(String userId, Long coverLetterId) {
        validateCoverLetterOwnership(userId, coverLetterId);
        Optional<ShareLink> shareLinkOptional = shareLinkRepository.findById(coverLetterId);

        return shareLinkOptional.map(ShareLinkActiveResponse::of)
                .orElseGet(ShareLinkActiveResponse::deactivate);
    }

    public boolean validateShareLink(String shareId) {
        ShareLink shareLink = shareLinkRepository.findByShareId(shareId)
                .orElseThrow(() -> new BaseException(ShareLinkErrorCode.SHARE_LINK_NOT_FOUND));
        return shareLink.isValid();
    }
}
