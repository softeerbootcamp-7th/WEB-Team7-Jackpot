package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.request.CoverLetterFilterRequest;
import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.request.CoverLetterAndQnAEditRequest;
import com.jackpot.narratix.domain.controller.request.CoverLettersSaveRequest;
import com.jackpot.narratix.domain.controller.response.CoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.FilteredCoverLettersResponse;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.SavedCoverLetterCountResponse;
import com.jackpot.narratix.domain.controller.response.TotalCoverLetterCountResponse;
import com.jackpot.narratix.domain.controller.response.UpcomingCoverLetterResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

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
    ResponseEntity<CreateCoverLetterResponse> createCoverLetter(
            @Parameter(hidden = true) String userId,
            CreateCoverLetterRequest createCoverLetterRequest
    );

    @Operation(summary = "자기소개서 수정", description = "기존 자기소개서의 정보를 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "자기소개서를 찾을 수 없음")
    })
    ResponseEntity<Void> editCoverLetter(
            @Parameter(hidden = true) String userId,
            CoverLetterAndQnAEditRequest coverLetterAndQnAEditRequest
    );

    @Operation(summary = "자기소개서 단건 조회", description = "ID로 자기소개서를 조회합니다.")
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
    ResponseEntity<CoverLetterResponse> findCoverLetterById(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "자기소개서 ID", required = true, example = "1") Long coverLetterId
    );

    @Operation(summary = "자기소개서 삭제", description = "ID로 자기소개서를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "자기소개서를 찾을 수 없음")
    })
    ResponseEntity<Void> deleteCoverLetterById(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "자기소개서 ID", required = true, example = "1") Long coverLetterId
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
    ResponseEntity<TotalCoverLetterCountResponse> getTotalCoverLetterCount(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "기준 날짜 (yyyy-MM-dd)", required = true, example = "2024-01-01") LocalDate date
    );

    @Operation(summary = "필터링된 자기소개서 조회", description = "필터링에 따라 자기소개서 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = FilteredCoverLettersResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    ResponseEntity<FilteredCoverLettersResponse> getAllCoverLetterByFilter(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "자기소개서 필터링 Request 정보", required = true)
            CoverLetterFilterRequest request
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
    ResponseEntity<List<UpcomingCoverLetterResponse>> getUpcomingCoverLetters(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "기준 날짜 (yyyy-MM-dd)", required = true, example = "2024-01-01") LocalDate date,
            @Parameter(description = "최대 마감일 개수", required = true) Integer maxDeadLineSize,
            @Parameter(description = "마감일당 최대 자기소개서 개수", required = true) Integer maxCoverLetterSizePerDeadLine
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
    ResponseEntity<List<LocalDate>> findDeadlineByDateRange(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "시작 날짜 (yyyy-MM-dd)", required = true, example = "2024-01-01") LocalDate startDate,
            @Parameter(description = "종료 날짜 (yyyy-MM-dd)", required = true, example = "2024-12-31") LocalDate endDate
    );

    @Operation(summary = "업로드된 자기소개서 저장", description = "업로드 작업(uploadJobId)에 해당하는 자기소개서 목록을 저장하고 작업을 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "저장 성공",
                    content = @Content(schema = @Schema(implementation = SavedCoverLetterCountResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "업로드 작업을 찾을 수 없음")
    })
    ResponseEntity<SavedCoverLetterCountResponse> saveUploadedCoverLetter(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "업로드 작업 ID", required = true, example = "abc123") String uploadJobId,
            CoverLettersSaveRequest request
    );
}