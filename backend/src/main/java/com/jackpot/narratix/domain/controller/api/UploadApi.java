package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.request.JobCreateRequest;
import com.jackpot.narratix.domain.controller.request.PresignedUrlRequest;
import com.jackpot.narratix.domain.controller.response.LabeledQnAListResponse;
import com.jackpot.narratix.domain.controller.response.PresignedUrlResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

@Tag(name = "업로드", description = "파일 업로드 API")
@SecurityRequirement(name = "JWT")
public interface UploadApi {

    @Operation(summary = "pre-signed url 발급 ", description = "pre-signed url을 발급합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "pre-signed url 발급 성공",
                    content = @Content(schema = @Schema(implementation = PresignedUrlResponse.class))),
    })
    ResponseEntity<PresignedUrlResponse> createPresignedUrl(
            @Parameter(hidden = true) String userId,
            PresignedUrlRequest request
    );

    @Operation(summary = "Job 생성과 AI 라벨링 시작 요청 ", description = "Job을 생성하고 람다를 호출합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "job생성 및 람다 호출 성공"),
    })
    ResponseEntity<Void> createJob(
            @Parameter(hidden = true) String userId,
            JobCreateRequest request
    );

    @Operation(summary = "라벨링된 자기소개서 QnA 조회", description = "업로드 Job ID에 해당하는 라벨링된 QnA 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = LabeledQnAListResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "Upload Job을 찾을 수 없음")
    })
    ResponseEntity<LabeledQnAListResponse> findLabeledCoverLetterByUploadJobId(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "업로드 Job ID", required = true) String uploadJobId
    );

}
