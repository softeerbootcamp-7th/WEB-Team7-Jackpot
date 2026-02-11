package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.request.EditCoverLetterRequest;
import com.jackpot.narratix.domain.controller.request.QnAEditRequest;
import com.jackpot.narratix.domain.controller.response.*;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.exception.CoverLetterErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.dto.QnACountProjection;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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

        if (!coverLetter.isOwner(userId)) throw new BaseException(GlobalErrorCode.FORBIDDEN);

        return CoverLetterResponse.of(coverLetter);
    }

    @Transactional
    public void deleteCoverLetterById(String userId, Long coverLetterId) {
        Optional<CoverLetter> coverLetterOptional = coverLetterRepository.findById(coverLetterId);
        if (coverLetterOptional.isEmpty()) return;
        if (!coverLetterOptional.get().isOwner(userId)) {
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

    @Transactional
    public void editCoverLetter(String userId, EditCoverLetterRequest editCoverLetterRequest) {
        CoverLetter coverLetter = coverLetterRepository.findByIdOrElseThrow(editCoverLetterRequest.coverLetterId());
        coverLetter.edit(userId, editCoverLetterRequest);
    }

    @Transactional(readOnly = true)
    public CoverLettersDateRangeResponse getAllCoverLetterByDate(
            String userId, LocalDate startDate, LocalDate endDate, Integer size
    ) {
        List<CoverLetter> coverLetters = coverLetterRepository.findInPeriod(
                userId, startDate, endDate, Pageable.ofSize(size)
        );

        if (coverLetters.isEmpty()) {
            return CoverLettersDateRangeResponse.of(0L, List.of());
        }

        return CoverLettersDateRangeResponse.of(
                coverLetterRepository.countByUserIdAndDeadlineBetween(userId, startDate, endDate),
                buildCoverLetterResponsesWithQnaCount(coverLetters)
        );
    }

    private List<CoverLettersDateRangeResponse.CoverLetterResponse> buildCoverLetterResponsesWithQnaCount(
            List<CoverLetter> coverLetters
    ) {
        List<Long> coverLetterIds = coverLetters.stream().map(CoverLetter::getId).toList();

        Map<Long, Long> qnaCountMap = qnARepository.countByCoverLetterIdIn(coverLetterIds)
                .stream()
                .collect(Collectors.toMap(
                        QnACountProjection::getCoverLetterId,
                        QnACountProjection::getCount
                ));

        return coverLetters.stream()
                .map(coverLetter -> CoverLettersDateRangeResponse.CoverLetterResponse.of(
                        coverLetter,
                        qnaCountMap.getOrDefault(coverLetter.getId(), 0L)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UpcomingCoverLetterResponse> getUpcomingCoverLetters(
            String userId, LocalDate date, Integer maxDeadLineSize, Integer maxCoverLetterSizePerDeadLine
    ) {
        Map<LocalDate, List<CoverLetter>> groupedCoverLetters =
                coverLetterRepository.findUpcomingCoverLettersGroupedByDeadline(
                        userId, date, maxDeadLineSize, maxCoverLetterSizePerDeadLine
                );

        return groupedCoverLetters.entrySet().stream()
                .map(UpcomingCoverLetterResponse::of)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Long> getQnAIdsByCoverLetterId(String userId, Long coverLetterId) {
        CoverLetter coverLetter = coverLetterRepository.findByIdWithQnAsOrElseThrow(coverLetterId);

        if (!coverLetter.isOwner(userId)) throw new BaseException(GlobalErrorCode.FORBIDDEN);

        return coverLetter.getQnAs().stream().map(QnA::getId).toList();
    }

    @Transactional(readOnly = true)
    public List<LocalDate> findDeadlineByDateRange(String userId, LocalDate startDate, LocalDate endDate) {
        validateDateRangeExceeded(startDate, endDate);

        return coverLetterRepository.findDeadlineByUserIdBetweenDeadline(userId, startDate, endDate);
    }

    private void validateDateRangeExceeded(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new BaseException(GlobalErrorCode.INVALID_INPUT_VALUE);
        }

        if (startDate.plusMonths(1).isBefore(endDate)) {
            throw new BaseException(CoverLetterErrorCode.DATE_RANGE_EXCEEDED);
        }
    }

    @Transactional(readOnly = true)
    public QnAResponse getQnAById(String userId, Long qnAId) {
        QnA qnA = qnARepository.findByIdOrElseThrow(qnAId);

        if(!qnA.isOwner(userId)) throw new BaseException(GlobalErrorCode.FORBIDDEN);

        return QnAResponse.of(qnA);
    }

    @Transactional
    public QnAEditResponse editQnA(String userId, QnAEditRequest request) {
        QnA qnA = qnARepository.findByIdOrElseThrow(request.qnAId());

        if(!qnA.isOwner(userId)) throw new BaseException(GlobalErrorCode.FORBIDDEN);

        qnA.editAnswer(request.answer());

        return new QnAEditResponse(qnA.getId(), qnA.getModifiedAt());
    }
}
