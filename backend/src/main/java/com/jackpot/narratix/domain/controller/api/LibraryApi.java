package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.response.CompanyLibraryResponse;
import com.jackpot.narratix.domain.controller.response.LibraryListResponse;
import com.jackpot.narratix.domain.entity.enums.LibraryType;
import com.jackpot.narratix.global.auth.UserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

@Tag(name = "라이브러리", description = "회사 및 질문 라이브러리 관리 API")
@SecurityRequirement(name = "JWT")
public interface LibraryApi {

    @Operation(summary = "라이브러리 목록 조회", description = "회사명 또는 질문 라이브러리 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = LibraryListResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/all")
    ResponseEntity<LibraryListResponse> getLibraryList(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "라이브러리 타입 (COMPANY 또는 QUESTION)", required = true)
            @RequestParam LibraryType libraryType
    );

    @Operation(summary = "회사별 자기소개서 목록 조회", description = "특정 회사의 자기소개서 목록을 페이징하여 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = CompanyLibraryResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/company/all")
    ResponseEntity<CompanyLibraryResponse> getCompanyLibraries(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "회사명", required = true) @RequestParam @NotBlank String companyName,
            @Parameter(description = "페이지 크기 (기본값: 10)") @RequestParam(defaultValue = "10") @Min(1) int size,
            @Parameter(description = "마지막 자기소개서 ID (다음 페이지 조회 시 사용)")
            @RequestParam(required = false) @Positive Optional<Long> lastCoverLetterId
    );
}