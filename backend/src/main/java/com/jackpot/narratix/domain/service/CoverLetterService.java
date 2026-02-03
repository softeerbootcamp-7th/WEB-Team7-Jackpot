package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.response.CoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.TotalCoverLetterCountResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.exception.CoverLetterErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;
    private final QnARepository qnARepository;

    @Transactional
    public CreateCoverLetterResponse createNewCoverLetter(String userId, CreateCoverLetterRequest createCoverLetterRequest) {
        CoverLetter coverLetter = CoverLetter.from(userId, createCoverLetterRequest);
        CoverLetter newCoverLetter = coverLetterRepository.save(coverLetter);

        return new CreateCoverLetterResponse(newCoverLetter.getId());
    }

    @Transactional(readOnly = true)
    public CoverLetterResponse findCoverLetterById(String userId, Long coverLetterId) {
        CoverLetter coverLetter = coverLetterRepository.findById(coverLetterId)
                .orElseThrow(() -> new BaseException(CoverLetterErrorCode.COVER_LETTER_NOT_FOUND));

        if(!coverLetter.isOwner(userId)) throw new BaseException(GlobalErrorCode.FORBIDDEN);

        return CoverLetterResponse.of(coverLetter);
    }
    @Transactional
    public void deleteCoverLetterById(String userId, Long coverLetterId) {
        Optional<CoverLetter> coverLetterOptional = coverLetterRepository.findById(coverLetterId);
        if(coverLetterOptional.isEmpty()) return;
        if(!coverLetterOptional.get().isOwner(userId)){
            throw new BaseException(GlobalErrorCode.FORBIDDEN);
        }

        coverLetterRepository.deleteById(coverLetterId);
    }
    @Transactional(readOnly = true)
    public TotalCoverLetterCountResponse getTotalCoverLetterCount(String userId, LocalDate date) {
        ApplyHalfType applyHalf = ApplyHalfType.calculateApplyHalfType(date);
        int applyYear = date.getYear();

        return TotalCoverLetterCountResponse.builder()
                .coverLetterCount(coverLetterRepository.countByUserId(userId))
                .qnaCount(qnARepository.countByUserId(userId))
                .seasonCoverLetterCount(coverLetterRepository.countByUserIdAndApplyYearAndApplyHalf(userId, applyYear, applyHalf))
                .build();
    }
}
