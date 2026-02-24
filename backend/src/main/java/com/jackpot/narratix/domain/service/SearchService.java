package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.SearchCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.SearchLibraryAndQnAResponse;
import com.jackpot.narratix.domain.controller.response.SearchScrapResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.exception.SearchErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ScrapRepository;
import com.jackpot.narratix.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ScrapRepository scrapRepository;
    private final CoverLetterRepository coverLetterRepository;
    private final QnARepository qnARepository;

    @Transactional(readOnly = true)
    public SearchScrapResponse searchScrap(
            String userId, String searchWord, Integer size, Long lastQnaId
    ) {
        String keyword = processSearchWord(searchWord);

        Slice<QnA> qnas = (keyword != null)
                ? getSearchScraps(userId, keyword, lastQnaId, size)
                : getAllScraps(userId, lastQnaId, size);

        List<QnA> qnaList = qnas.getContent();

        List<Long> coverLetterIds = qnaList.stream()
                .map(qna -> qna.getCoverLetter().getId())
                .distinct()
                .toList();

        Map<Long, CoverLetter> coverLetterMap = coverLetterRepository.findAllById(coverLetterIds).stream()
                .collect(Collectors.toMap(CoverLetter::getId, c -> c));

        return SearchScrapResponse.of(qnaList, coverLetterMap, qnas.hasNext());
    }

    private Slice<QnA> getAllScraps(String userId, Long lastQnaId, Integer size) {
        if (lastQnaId == null) {
            return scrapRepository.findScraps(userId, size);
        }
        return scrapRepository.findScrapsNext(userId, lastQnaId, size);
    }

    private Slice<QnA> getSearchScraps(String userId, String keyword, Long lastQnaId, Integer size) {
        if (lastQnaId == null) {
            return scrapRepository.searchQnAInScraps(userId, keyword, size);
        }
        return scrapRepository.searchQnAInScrapsNext(userId, keyword, lastQnaId, size);
    }

    @Transactional(readOnly = true)
    public SearchCoverLetterResponse searchCoverLetter(
            String userId, String searchWord, Integer size, Integer page
    ) {
        String keyword = processSearchWord(searchWord);

        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size);

        Page<CoverLetter> resultPage = coverLetterRepository.searchCoverLetters(userId, keyword, pageable);

        return SearchCoverLetterResponse.from(resultPage);
    }

    @Transactional(readOnly = true)
    public SearchLibraryAndQnAResponse searchLibraryAndQnA(String userId, String searchWord, Integer size, Long lastQnAId) {

        if (!StringUtils.hasText(searchWord)) {
            throw new BaseException(SearchErrorCode.INVALID_SEARCH_KEYWORD);
        }

        String keyword = processSearchWord(searchWord);

        List<QuestionCategoryType> questionLibraries = qnARepository.searchQuestionCategory(userId, keyword);

        Slice<QnA> qnAs = qnARepository.searchQnA(userId, keyword, size, lastQnAId);

        Long qnACount = qnARepository.countSearchQnA(userId, keyword);
        return SearchLibraryAndQnAResponse.of(questionLibraries, qnACount, qnAs.getContent(), qnAs.hasNext());
    }

    private String processSearchWord(String searchWord) {
        if (!StringUtils.hasText(searchWord)) {
            return null;
        }
        String keyword = searchWord.trim();
        if (keyword.length() < 2) {
            throw new BaseException(SearchErrorCode.INVALID_SEARCH_KEYWORD);
        }
        return keyword;
    }
}



