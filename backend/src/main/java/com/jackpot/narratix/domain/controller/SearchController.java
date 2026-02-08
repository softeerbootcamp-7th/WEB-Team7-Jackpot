package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.api.SearchApi;
import com.jackpot.narratix.domain.controller.response.SearchScrapResponse;
import com.jackpot.narratix.global.auth.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/search")
public class SearchController implements SearchApi {

    private final SearchService searchService;

    @Override
    @GetMapping
    public ResponseEntity<SearchScrapResponse> searchScrap(
            @UserId String userId,
            @RequestParam String searchWord,
            @RequestParam Integer size,
            @RequestParam Long lastQnaId
    ) {
        return ResponseEntity.ok(searchService.searchScrap(userId, searchWord, size, lastQnaId));
    }
}
