package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.*;
import com.jackpot.narratix.domain.controller.response.*;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.UploadJob;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.exception.CoverLetterErrorCode;
import com.jackpot.narratix.domain.exception.QnAErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ScrapRepository;
import com.jackpot.narratix.domain.repository.UploadJobRepository;
import com.jackpot.narratix.domain.repository.dto.QnACountProjection;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;
    private final QnARepository qnARepository;
    private final UploadJobRepository uploadJobRepository;
    private final ScrapRepository scrapRepository;

    @Transactional
    public CreateCoverLetterResponse createNewCoverLetter(String userId, CreateCoverLetterRequest createCoverLetterRequest) {
        CoverLetter coverLetter = createCoverLetterRequest.toEntity(userId);
        coverLetter = coverLetterRepository.save(coverLetter);

        return new CreateCoverLetterResponse(coverLetter.getId());
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
    public void editCoverLetterAndQnA(String userId, CoverLetterAndQnAEditRequest request) {
        Long coverLetterId = request.coverLetter().coverLetterId();
        CoverLetter coverLetter = coverLetterRepository.findByIdWithQnAsOrElseThrow(coverLetterId);

        if (!coverLetter.isOwner(userId)) throw new BaseException(GlobalErrorCode.FORBIDDEN);
        coverLetter.edit(request.coverLetter());

        List<CoverLetterAndQnAEditRequest.QnAEditRequest> newQnARequests = request.questions().stream()
                .filter(q -> q.qnAId() == null)
                .toList();

        List<CoverLetterAndQnAEditRequest.QnAEditRequest> existingQnARequests = request.questions().stream()
                .filter(q -> q.qnAId() != null)
                .toList();

        Set<Long> keepIds = existingQnARequests.stream()
                .map(CoverLetterAndQnAEditRequest.QnAEditRequest::qnAId)
                .collect(Collectors.toSet());
        coverLetter.removeQnAsNotIn(keepIds);

        Map<Long, QnA> qnAMap = coverLetter.getQnAs().stream()
                .collect(Collectors.toMap(QnA::getId, qnA -> qnA));

        for (CoverLetterAndQnAEditRequest.QnAEditRequest qnAEditRequest : existingQnARequests) {
            QnA qnA = Optional.ofNullable(qnAMap.get(qnAEditRequest.qnAId()))
                    .orElseThrow(() -> new BaseException(QnAErrorCode.QNA_NOT_FOUND));
            qnA.editQuestion(qnAEditRequest.question(), qnAEditRequest.category());
        }

        // 새 QnA 추가
        List<QnA> newQnAs = newQnARequests.stream()
                .map(q -> QnA.builder()
                        .userId(userId)
                        .question(q.question())
                        .questionCategory(q.category())
                        .build())
                .toList();
        coverLetter.addQnAs(newQnAs);
    }

    @Transactional(readOnly = true)
    public FilteredCoverLettersResponse getAllCoverLetterByFilter(String userId, CoverLetterFilterRequest request) {
        Slice<CoverLetter> slice = coverLetterRepository.findByFilter(
                userId,
                request.startDate(),
                request.endDate(),
                request.isShared(),
                request.lastCoverLetterId(),
                request.size()
        );

        if (slice.isEmpty()) {
            return FilteredCoverLettersResponse.of(
                    coverLetterRepository.countByFilter(
                            userId,
                            request.startDate(),
                            request.endDate(),
                            request.isShared()
                    ),
                    List.of(),
                    false
            );
        }

        return FilteredCoverLettersResponse.of(
                coverLetterRepository.countByFilter(
                        userId,
                        request.startDate(),
                        request.endDate(),
                        request.isShared()
                ),
                buildCoverLetterResponsesWithQnaCount(slice.getContent()),
                slice.hasNext()
        );
    }

    private List<FilteredCoverLettersResponse.CoverLetterResponse> buildCoverLetterResponsesWithQnaCount(
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
                .map(coverLetter -> FilteredCoverLettersResponse.CoverLetterResponse.of(
                        coverLetter, qnaCountMap.getOrDefault(coverLetter.getId(), 0L)
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

        return qnARepository.findIdsByCoverLetterId(coverLetterId);
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

        if (!qnA.isOwner(userId)) throw new BaseException(GlobalErrorCode.FORBIDDEN);

        Boolean isScraped = scrapRepository.existsById(userId, qnAId);

        return QnAResponse.of(qnA, isScraped);
    }

    @Transactional
    public QnAEditResponse editQnA(String userId, QnAEditRequest request) {
        QnA qnA = qnARepository.findByIdOrElseThrow(request.qnAId());

        if (!qnA.isOwner(userId)) throw new BaseException(GlobalErrorCode.FORBIDDEN);

        qnA.editAnswer(request.answer());

        return new QnAEditResponse(qnA.getId(), qnA.getModifiedAt());
    }

    @Transactional(readOnly = true)
    public QnAListResponse getQnAsByQnAIds(String userId, List<Long> qnAIds) {

        List<QnA> qnAs = qnARepository.findByIds(qnAIds);
        if (qnAs.isEmpty()) return new QnAListResponse(Collections.emptyList());

        // qnAIds가 모두 하나의 coverLetter와 연관관계를 갖는지 확인
        boolean isSameCoverLetter = qnAs.stream()
                .map(qnA -> qnA.getCoverLetter().getId())
                .distinct()
                .count() == 1;

        if (!isSameCoverLetter) throw new BaseException(QnAErrorCode.NOT_SAME_COVERLETTER);
        if (!qnAs.get(0).isOwner(userId)) throw new BaseException(GlobalErrorCode.FORBIDDEN);


        return new QnAListResponse(
                qnAs.stream()
                        .map(QnAListResponse.QnAResponse::of)
                        .toList()
        );
    }

    @Transactional
    public SavedCoverLetterCountResponse saveCoverLetterAndDeleteJob(
            String userId, String uploadJobId, CoverLettersSaveRequest request
    ) {
        List<CoverLetter> coverLetters = request.toEntity(userId);
        coverLetters = coverLetterRepository.saveAll(coverLetters);

        int savedCount = coverLetters.size();

        Optional<UploadJob> uploadJobOpt = uploadJobRepository.findById(uploadJobId);
        if (uploadJobOpt.isPresent()) {
            UploadJob uploadJob = uploadJobOpt.get();
            if (!uploadJob.isOwner(userId)) {
                throw new BaseException(GlobalErrorCode.FORBIDDEN);
            }
            // cascade로 연관된 UploadFile과 LabeledQnA도 함께 삭제됨
            uploadJobRepository.deleteById(uploadJobId);
        }

        return new SavedCoverLetterCountResponse(savedCount);
    }

    @Transactional(readOnly = true)
    public List<String> getCompanies(String userId) {
        return coverLetterRepository.findCompanyNamesByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<String> getJobPositions(String userId) {
        return coverLetterRepository.findJobPositionsByUserId(userId);
    }
}
