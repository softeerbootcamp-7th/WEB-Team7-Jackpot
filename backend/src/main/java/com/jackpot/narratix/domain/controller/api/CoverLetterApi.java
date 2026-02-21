package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.request.EditCoverLetterRequest;
import com.jackpot.narratix.domain.controller.response.CoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.CoverLettersDateRangeResponse;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.TotalCoverLetterCountResponse;
import com.jackpot.narratix.domain.controller.response.UpcomingCoverLetterResponse;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "자기소개서", description = "자기소개서 관리 API")
@SecurityRequirement(name = "JWT")
public interface CoverLetterApi {

    @Operation(summary = "자기소개서 생성", description = "새로운 자기소개서를 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "생성 성공",
                    content = @Content(schema = @Schema(implementation = CreateCoverLetterResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping
    ResponseEntity<CreateCoverLetterResponse> createCoverLetter(
            @Parameter(hidden = true) @UserId String userId,
            @Valid @RequestBody CreateCoverLetterRequest createCoverLetterRequest
    );

    @Operation(summary = "자기소개서 수정", description = "기존 자기소개서의 정보를 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "자기소개서를 찾을 수 없음")
    })
    @PutMapping
    ResponseEntity<Void> editCoverLetter(
            @Parameter(hidden = true) @UserId String userId,
            @Valid @RequestBody EditCoverLetterRequest editCoverLetterRequest
    );

    @Operation(summary = "자기소개서 조회", description = "ID로 자기소개서를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = CoverLetterResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "자기소개서를 찾을 수 없음")
    })
    @GetMapping
    ResponseEntity<CoverLetterResponse> findCoverLetterById(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "자기소개서 ID", required = true) @RequestParam Long coverLetterId
    );

    @Operation(summary = "자기소개서 삭제", description = "ID로 자기소개서를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "자기소개서를 찾을 수 없음")
    })
    @DeleteMapping
    ResponseEntity<Void> deleteCoverLetterById(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "자기소개서 ID", required = true) @RequestParam Long coverLetterId
    );

    @Operation(summary = "자기소개서 개수 조회", description = "특정 날짜 기준으로 자기소개서 개수를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = TotalCoverLetterCountResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/count")
    ResponseEntity<TotalCoverLetterCountResponse> getTotalCoverLetterCount(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "기준 날짜 (yyyy-MM-dd)", required = true, example = "2024-01-01")
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date
    );

    @Operation(summary = "날짜 범위로 자기소개서 조회", description = "시작일과 종료일 사이의 자기소개서 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = CoverLettersDateRangeResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/all")
    ResponseEntity<CoverLettersDateRangeResponse> getAllCoverLetterByDate(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "시작 날짜 (yyyy-MM-dd)", required = true, example = "2024-01-01")
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @Parameter(description = "종료 날짜 (yyyy-MM-dd)", required = true, example = "2024-12-31")
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @Parameter(description = "페이지 크기", required = true) @RequestParam Integer size
    );

    @Operation(summary = "다가오는 마감일 자기소개서 조회", description = "마감일이 임박한 자기소개서 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = UpcomingCoverLetterResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/upcoming")
    ResponseEntity<List<UpcomingCoverLetterResponse>> getUpcomingCoverLetters(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "기준 날짜 (yyyy-MM-dd)", required = true, example = "2024-01-01")
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date,
            @Parameter(description = "최대 마감일 개수", required = true) @RequestParam Integer maxDeadLineSize,
            @Parameter(description = "마감일당 최대 자기소개서 개수", required = true) @RequestParam Integer maxCoverLetterSizePerDeadLine
    );

    @Operation(summary = "마감일 목록 조회", description = "날짜 범위 내의 마감일 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = LocalDate.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/calendar")
    ResponseEntity<List<LocalDate>> findDeadlineByDateRange(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "시작 날짜 (yyyy-MM-dd)", required = true, example = "2024-01-01")
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @Parameter(description = "종료 날짜 (yyyy-MM-dd)", required = true, example = "2024-12-31")
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate
    );
}