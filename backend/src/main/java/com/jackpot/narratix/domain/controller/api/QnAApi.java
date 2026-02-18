package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.request.QnAEditRequest;
import com.jackpot.narratix.domain.controller.response.QnAEditResponse;
import com.jackpot.narratix.domain.controller.response.QnAListResponse;
import com.jackpot.narratix.domain.controller.response.QnAResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;

@Tag(name = "질문/답변", description = "자기소개서 질문 및 답변 관리 API")
@SecurityRequirement(name = "JWT")
public interface QnAApi {

    @Operation(summary = "질문/답변 수정", description = "자기소개서의 질문 및 답변을 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "수정 성공",
                    content = @Content(schema = @Schema(implementation = QnAEditResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "질문/답변을 찾을 수 없음")
    })
    ResponseEntity<QnAEditResponse> editQnA(
            @Parameter(hidden = true) String userId,
            QnAEditRequest request
    );

    @Operation(summary = "QnA 단건 조회", description = "ID로 질문 및 답변을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = QnAResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "QnA를 찾을 수 없음")
    })
    ResponseEntity<QnAResponse> getQnAById(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "질문/답변 ID", required = true, example = "1") Long qnAId
    );

    @Operation(summary = "자기소개서의 질문 ID 목록 조회", description = "특정 자기소개서에 속한 모든 질문의 ID 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = Long.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "자기소개서를 찾을 수 없음")
    })
    ResponseEntity<List<Long>> getQnAIdsByCoverLetterId(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "자기소개서 ID") Long coverLetterId
    );

    @Operation(summary = "QnA ID 목록으로 QnA 목록 조회", description = "QnA ID 목록으로 QnA 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = QnAListResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    ResponseEntity<QnAListResponse> getQnAsByQnAIds(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "QnA ID 목록") List<Long> qnAIds
    );
}