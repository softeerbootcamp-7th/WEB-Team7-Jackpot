package com.jackpot.narratix.domain.repository;

import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.exception.CoverLetterErrorCode;
import com.jackpot.narratix.global.exception.BaseException;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.jackpot.narratix.domain.entity.QCoverLetter.coverLetter;
import static com.jackpot.narratix.domain.entity.QShareLink.shareLink;
import static java.util.stream.Collectors.groupingBy;

@Repository
@RequiredArgsConstructor
public class CoverLetterRepositoryImpl implements CoverLetterRepository {

    private final CoverLetterJpaRepository coverLetterJpaRepository;
    private final JPAQueryFactory queryFactory;

    @Override
    public CoverLetter save(CoverLetter coverLetter) {
        return coverLetterJpaRepository.save(coverLetter);
    }

    @Override
    public Optional<CoverLetter> findById(Long coverLetterId) {
        return coverLetterJpaRepository.findById(coverLetterId);
    }

    @Override
    public void deleteById(Long coverLetterId) {
        coverLetterJpaRepository.deleteById(coverLetterId);
    }

    @Override
    public CoverLetter findByIdOrElseThrow(Long coverLetterId) {
        return coverLetterJpaRepository.findById(coverLetterId)
                .orElseThrow(() -> new BaseException(CoverLetterErrorCode.COVER_LETTER_NOT_FOUND));
    }

    @Override
    public List<CoverLetter> findInPeriod(
            String userId, LocalDate startDate, LocalDate endDate, Pageable pageable
    ) {
        return coverLetterJpaRepository.findByUserIdAndDeadlineBetweenOrderByDeadlineAscModifiedAtDesc(
                userId, startDate, endDate, pageable
        );
    }

    @Override
    public Long countByUserIdAndDeadlineBetween(String userId, LocalDate startDate, LocalDate endDate) {
        return coverLetterJpaRepository.countByUserIdAndDeadlineBetween(userId, startDate, endDate);
    }

    @Override
    public Integer countByUserId(String userId) {
        return coverLetterJpaRepository.countByUserId(userId);
    }

    @Override
    public Integer countByUserIdAndApplyYearAndApplyHalf(String userId, int applyYear, ApplyHalfType applyHalfType) {
        return coverLetterJpaRepository.countByUserIdAndApplyYearAndApplyHalf(userId, applyYear, applyHalfType);
    }

    @Override
    public List<String> findCompanyNamesByUserId(String userId) {
        return coverLetterJpaRepository.findDistinctCompanyNamesByUserId(userId);
    }

    @Override
    public Slice<CoverLetter> findByUserIdAndCompanyNameOrderByModifiedAtDesc(String userId, String companyName, Pageable pageable) {
        return coverLetterJpaRepository.findByUserIdAndCompanyNameOrderByModifiedAtDesc(
                userId,
                companyName,
                pageable
        );
    }

    @Override
    public Slice<CoverLetter> findByUserIdAndCompanyNameOrderByModifiedAtDesc(String userId, String companyName, LocalDateTime localDate, Pageable pageable) {
        return coverLetterJpaRepository.findNextPageByCompany(
                userId,
                companyName,
                localDate,
                pageable
        );
    }

    @Override
    public CoverLetter findByIdWithQnAsOrElseThrow(Long coverLetterId) {
        return coverLetterJpaRepository.findByIdWithQnAs(coverLetterId)
                .orElseThrow(() -> new BaseException(CoverLetterErrorCode.COVER_LETTER_NOT_FOUND));
    }

    @Override
    public List<LocalDate> findDeadlineByUserIdBetweenDeadline(String userId, LocalDate startDate, LocalDate endDate) {
        return coverLetterJpaRepository.findDeadlineByUserIdBetweenDeadline(userId, startDate, endDate);
    }

    @Override
    public Map<LocalDate, List<CoverLetter>> findUpcomingCoverLettersGroupedByDeadline(
            String userId, LocalDate date, int maxDeadLineSize, int maxCoverLetterSizePerDeadLine
    ) {
        List<CoverLetter> coverLetters = coverLetterJpaRepository
                .findUpcomingCoverLettersGroupedByDeadline(userId, date, maxDeadLineSize, maxCoverLetterSizePerDeadLine);

        return coverLetters.stream()
                .collect(groupingBy(
                        CoverLetter::getDeadline, LinkedHashMap::new, Collectors.toList()
                ));
    }

    @Override
    public Page<CoverLetter> searchCoverLetters(
            String userId, String keyword, Pageable pageable
    ) {
        return coverLetterJpaRepository.searchCoverLetters(userId, keyword, pageable);
    }

    @Override
    public Slice<CoverLetter> findByFilter(
            String userId,
            LocalDate startDate,
            LocalDate endDate,
            Boolean isShared,
            Long lastCoverLetterId,
            int size
    ) {
        long fetchSize = size + 1L;

        List<CoverLetter> results = queryFactory
                .selectFrom(coverLetter)
                .leftJoin(shareLink).on(coverLetter.id.eq(shareLink.coverLetterId))
                .where(createFilterConditions(userId, startDate, endDate, isShared, lastCoverLetterId))
                .orderBy(coverLetter.createdAt.desc(), coverLetter.id.desc())
                .limit(fetchSize)
                .fetch();

        boolean hasNext = results.size() > size;
        List<CoverLetter> content = hasNext ? results.subList(0, size) : results;

        return new SliceImpl<>(content, PageRequest.of(0, size), hasNext);
    }

    @Override
    public Long countByFilter(
            String userId,
            LocalDate startDate,
            LocalDate endDate,
            Boolean isShared
    ) {
        return queryFactory
                .select(coverLetter.count())
                .from(coverLetter)
                .leftJoin(shareLink).on(coverLetter.id.eq(shareLink.coverLetterId))
                .where(createFilterConditions(userId, startDate, endDate, isShared, null))
                .fetchOne();
    }

    private BooleanBuilder createFilterConditions(
            String userId,
            LocalDate startDate,
            LocalDate endDate,
            Boolean isShared,
            Long lastCoverLetterId
    ) {
        BooleanBuilder builder = new BooleanBuilder();

        builder.and(coverLetter.userId.eq(userId));

        if (startDate != null) {
            builder.and(coverLetter.deadline.goe(startDate));
        }
        if (endDate != null) {
            builder.and(coverLetter.deadline.loe(endDate));
        }

        if (isShared != null) {
            if (isShared) {
                builder.and(shareLink.isShared.isTrue());
            } else {
                builder.and(shareLink.coverLetterId.isNull().or(shareLink.isShared.isFalse()));
            }
        }

        if (lastCoverLetterId != null) {
            applyCursorPagination(builder, lastCoverLetterId); // 커서 페이징 조건
        }

        return builder;
    }

    private void applyCursorPagination(BooleanBuilder builder, Long lastCoverLetterId) {
        coverLetterJpaRepository.findById(lastCoverLetterId)
                .ifPresent(lastCoverLetter -> {
                    BooleanExpression cursorCondition = buildCursorCondition(lastCoverLetter);
                    builder.and(cursorCondition);
                });
    }

    private BooleanExpression buildCursorCondition(CoverLetter lastCoverLetter) {
        BooleanExpression isBeforeLastCreatedAt = coverLetter.createdAt.lt(lastCoverLetter.getCreatedAt());
        BooleanExpression isSameCreatedAtButSmallerId = coverLetter.createdAt.eq(lastCoverLetter.getCreatedAt())
                .and(coverLetter.id.lt(lastCoverLetter.getId()));

        return isBeforeLastCreatedAt.or(isSameCreatedAtButSmallerId);
    }
}
