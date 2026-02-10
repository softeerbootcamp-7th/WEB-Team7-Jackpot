package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.response.SearchCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.SearchScrapResponse;
import com.jackpot.narratix.global.auth.UserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "검색", description = "검색 API")
@SecurityRequirement(name = "JWT")
public interface SearchApi {

    @Operation(summary = "문항 스크랩 내 검색", description = "스크랩 내에서 검색 결과를 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "성공",
                    content = @Content(schema = @Schema(implementation = SearchScrapResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
    })
    @GetMapping
    ResponseEntity<SearchScrapResponse> searchScrap(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "검색 키워드") @RequestParam(required = false) String searchWord,
            @Parameter(description = "페이지 크기") @RequestParam(required = false, defaultValue = "10") Integer size,
            @Parameter(description = "마지막 문항 아이디") @RequestParam(required = false) Long lastQnaId
    );

    @Operation(summary = "전체 자기소개서 내 검색", description = "전체 자기소개서에서 검색 결과를 조회합니다")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "성공",
                    content = @Content(schema = @Schema(implementation = SearchCoverLetterResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
    })
    @GetMapping
    ResponseEntity<SearchCoverLetterResponse> searchCoverLetter(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "검색 키워드") @RequestParam(required = false) String searchWord,
            @Parameter(description = "페이지 사이즈") @RequestParam(required = false, defaultValue = "9") Integer size,
            @Parameter(description = "페이지") @RequestParam(required = false, defaultValue = "1") Integer page
    );


}
