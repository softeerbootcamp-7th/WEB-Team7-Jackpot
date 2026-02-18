package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.CoverLetterAndQnAIdsResponse;
import com.jackpot.narratix.domain.service.TextDeltaService;
import com.jackpot.narratix.domain.controller.response.QnAVersionResponse;
import com.jackpot.narratix.domain.controller.response.ShareLinkActiveResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.ShareLink;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.exception.ShareLinkErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ShareLinkRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShareLinkService {

    private final CoverLetterRepository coverLetterRepository;
    private final QnARepository qnARepository;
    private final ShareLinkRepository shareLinkRepository;
    private final ShareLinkLockManager shareLinkLockManager;
    private final TextDeltaService textDeltaService;

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

    public boolean accessShareLink(String sessionId, String userId, ReviewRoleType role, String shareId) {
        return shareLinkLockManager.tryLock(sessionId, shareId, role, userId);
    }

    @Transactional(readOnly = true)
    public ReviewRoleType validateShareLinkAndGetRole(String userId, String shareId) {
        ShareLink shareLink = findValidShareLink(shareId);

        CoverLetter coverLetter = coverLetterRepository.findByIdOrElseThrow(shareLink.getCoverLetterId());
        return coverLetter.isOwner(userId) ? ReviewRoleType.WRITER : ReviewRoleType.REVIEWER;
    }

    @Transactional(readOnly = true)
    public Optional<ShareLink> getActiveShareLinkByCoverLetterId(Long coverLetterId) {
        Optional<ShareLink> shareLink = shareLinkRepository.findById(coverLetterId);
        if (shareLink.isEmpty()) {
            log.info("share link not found. coverLetterId={}", coverLetterId);
            return Optional.empty();
        }

        if (!shareLink.get().isValid()) {
            log.info("share link is not valid. coverLetterId={}", coverLetterId);
            return Optional.empty();
        }

        return shareLink;
    }

    @Transactional(readOnly = true)
    public QnAVersionResponse getQnAWithVersion(String userId, String shareId, Long qnAId) {
        // TODO: userId로 Writer 또는 Reviewer인지 검증해야 함

        ShareLink shareLink = findValidShareLink(shareId);
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);

        validateShareLinkAndQnA(shareLink, qnA);

        // 세션 시작 시 1회: Redis 버전 카운터를 QnA.version으로 초기화
        // 이후 delta push마다 DB 조회 없이 Redis INCR만으로 절대 버전 획득
        textDeltaService.initDeltaVersion(qnA.getId(), qnA.getVersion());

        return QnAVersionResponse.of(qnA);
    }

    private void validateShareLinkAndQnA(ShareLink shareLink, QnA qnA) {
        if (!Objects.equals(shareLink.getCoverLetterId(), qnA.getCoverLetter().getId())) {
            log.warn("해당 첨삭링크로 해당 QnA를 조회할 수 없습니다. shareId={}, QnAId={}", shareLink.getShareId(), qnA.getId());
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }
    }

    @Transactional(readOnly = true)
    public CoverLetterAndQnAIdsResponse getCoverLetterAndQnAIds(String userId, String shareId) {
        // TODO: userId로 Writer 또는 Reviewer인지 검증해야 함

        ShareLink shareLink = findValidShareLink(shareId);
        CoverLetter coverLetter = coverLetterRepository.findByIdOrElseThrow(shareLink.getCoverLetterId());
        List<Long> qnAIds = qnARepository.findIdsByCoverLetterId(coverLetter.getId());

        return CoverLetterAndQnAIdsResponse.of(coverLetter, qnAIds);
    }

    private ShareLink findValidShareLink(String shareId) {
        ShareLink shareLink = shareLinkRepository.findByShareId(shareId)
                .orElseThrow(() -> new BaseException(ShareLinkErrorCode.SHARE_LINK_NOT_FOUND));
        if (!shareLink.isValid()) {
            log.warn("해당 첨삭 링크가 유효하지 않습니다. shareId={}", shareId);
            throw new BaseException(ShareLinkErrorCode.SHARE_LINK_EXPIRED);
        }
        return shareLink;
    }
}
