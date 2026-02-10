package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.api.SearchApi;
import com.jackpot.narratix.domain.controller.response.SearchCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.SearchLibraryAndQnAResponse;
import com.jackpot.narratix.domain.controller.response.SearchScrapResponse;
import com.jackpot.narratix.domain.service.LibraryService;
import com.jackpot.narratix.domain.service.SearchService;
import com.jackpot.narratix.global.auth.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/v1/search")
public class SearchController implements SearchApi {

    private final SearchService searchService;
    private final LibraryService libraryService;

    @Override
    @GetMapping("/scrap")
    public ResponseEntity<SearchScrapResponse> searchScrap(
            @UserId String userId,
            @RequestParam(required = false) String searchWord,
            @RequestParam(required = false, defaultValue = "10") Integer size,
            @RequestParam(required = false) Long lastQnaId
    ) {
        return ResponseEntity.ok(searchService.searchScrap(userId, searchWord, size, lastQnaId));
    }

    @Override
    @GetMapping("/coverletter")
    public ResponseEntity<SearchCoverLetterResponse> searchCoverLetter(
            @UserId String userId,
            @RequestParam(required = false) String searchWord,
            @RequestParam(required = false, defaultValue = "10") Integer size,
            @RequestParam(required = false, defaultValue = "1") Integer page
    ) {
        return ResponseEntity.ok(searchService.searchCoverLetter(userId, searchWord, size, page));
    }

    @Override
    public ResponseEntity<SearchLibraryAndQnAResponse> searchLibraryAndQnA(
            @UserId String userId,
            @RequestParam String searchWord,
            @RequestParam(required = false) Long lastQnaId,
            @RequestParam Integer size) {
        return ResponseEntity.ok(libraryService.searchLibraryAndQnA(userId, searchWord, size, lastQnaId));
    }

}
