package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.request.CreateScrapRequest;
import com.jackpot.narratix.domain.controller.response.CreateScrapResponse;
import com.jackpot.narratix.domain.controller.response.ScrapCountResponse;
import com.jackpot.narratix.global.auth.UserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "스크랩", description = "스크랩 기능 관련 API")
@SecurityRequirement(name = "JWT")
public interface ScrapApi {

    @Operation(summary = "스크랩 생성", description = "특정 항목을 스크랩합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "스크랩 성공",
                    content = @Content(schema = @Schema(implementation = CreateScrapResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "409", description = "이미 스크랩한 문항"),
    })
    @PostMapping
    ResponseEntity<CreateScrapResponse> createScrap(
            @Parameter(hidden = true) @UserId String userId,
            @RequestBody @Valid CreateScrapRequest request
    );

    @Operation(summary = "스크랩 개수 조회", description = "사용자가 스크랩한 총 개수를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ScrapCountResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/count")
    ResponseEntity<ScrapCountResponse> getScrapCount(
            @Parameter(hidden = true) @UserId String userId
    );

    @Operation(summary = "스크랩 삭제", description = "문항 id로 스크랩을 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ScrapCountResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "삭제 권한이 없는 사용자")
    })
    @DeleteMapping("/{qnaId}")
    ResponseEntity<ScrapCountResponse> deleteScrapById(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "문항 ID", required = true, example = "1") @PathVariable Long qnaId
    );

}