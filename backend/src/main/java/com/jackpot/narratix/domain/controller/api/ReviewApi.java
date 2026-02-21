package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.response.ReviewsGetResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

@Tag(name = "첨삭", description = "첨삭 댓글 관리 API")
@SecurityRequirement(name = "JWT")
public interface ReviewApi {

    @Operation(summary = "첨삭 댓글 생성", description = "QnA에 대한 첨삭 댓글을 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "QnA를 찾을 수 없음")
    })
    ResponseEntity<Void> createReview(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "QnA ID", required = true, example = "1") Long qnAId,
            ReviewCreateRequest request
    );

    @Operation(summary = "첨삭 댓글 수정", description = "작성한 첨삭 댓글을 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음 (작성자가 아님)"),
            @ApiResponse(responseCode = "404", description = "첨삭 댓글을 찾을 수 없음")
    })
    ResponseEntity<Void> editReview(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "QnA ID", required = true, example = "1") Long qnAId,
            @Parameter(description = "첨삭 댓글 ID", required = true, example = "1") Long reviewId,
            ReviewEditRequest request
    );

    @Operation(summary = "첨삭 댓글 삭제", description = "첨삭 댓글을 삭제합니다. (작성자 또는 QnA 작성자만 가능)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음 (작성자 또는 QnA 작성자가 아님)"),
            @ApiResponse(responseCode = "404", description = "첨삭 댓글을 찾을 수 없음")
    })
    ResponseEntity<Void> deleteReview(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "QnA ID", required = true, example = "1") Long qnAId,
            @Parameter(description = "첨삭 댓글 ID", required = true, example = "1") Long reviewId
    );

    @Operation(summary = "첨삭 댓글 적용", description = "첨삭 댓글의 제안 내용을 승인하여 적용합니다. (QnA 작성자만 가능)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "적용 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음 (QnA 작성자가 아님)"),
            @ApiResponse(responseCode = "404", description = "첨삭 댓글을 찾을 수 없음")
    })
    ResponseEntity<Void> approveReview(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "QnA ID", required = true, example = "1") Long qnAId,
            @Parameter(description = "첨삭 댓글 ID", required = true, example = "1") Long reviewId
    );

    @Operation(summary = "첨삭 댓글 전체 조회", description = "QnA에 대한 모든 첨삭 댓글을 조회합니다. Writer는 모든 댓글을, Reviewer는 자신이 작성한 댓글만 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ReviewsGetResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "QnA를 찾을 수 없음")
    })
    ResponseEntity<ReviewsGetResponse> getAllReviews(
            @Parameter(hidden = true) String userId,
            @Parameter(description = "QnA ID", required = true, example = "1") Long qnAId
    );
}