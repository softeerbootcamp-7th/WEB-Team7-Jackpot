package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.request.ShareLinkActiveRequest;
import com.jackpot.narratix.domain.controller.response.CoverLetterAndQnAIdsResponse;
import com.jackpot.narratix.domain.controller.response.QnAVersionResponse;
import com.jackpot.narratix.domain.controller.response.ShareLinkActiveResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

@Tag(name = "첨삭 링크", description = "자기소개서 첨삭 링크 관련 API")
public interface ShareLinkApi {

    @Operation(summary = "첨삭 링크 활성화/비활성화", description = "자기소개서의 첨삭 링크를 활성화하거나 비활성화합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "첨삭 링크 활성화/비활성화 성공",
                    content = @Content(schema = @Schema(implementation = ShareLinkActiveResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음 (본인의 자기소개서가 아님)"),
            @ApiResponse(responseCode = "404", description = "자기소개서를 찾을 수 없음")
    })
    ResponseEntity<ShareLinkActiveResponse> updateShareLinkStatus(
            @Parameter(hidden = true) String userId, Long coverLetterId, ShareLinkActiveRequest request
    );

    @Operation(summary = "첨삭 링크 조회", description = "자기소개서의 첨삭 링크 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "첨삭 링크 조회 성공",
                    content = @Content(schema = @Schema(implementation = ShareLinkActiveResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음 (본인의 자기소개서가 아님)"),
            @ApiResponse(responseCode = "404", description = "자기소개서를 찾을 수 없음")
    })
    ResponseEntity<ShareLinkActiveResponse> getShareLinkStatus(
            @Parameter(hidden = true) String userId, Long coverLetterId
    );

    @Operation(summary = "첨삭 링크로 QnA 조회", description = "첨삭 링크를 통해 특정 QnA와 QnA의 버전 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "QnA 조회 성공",
                    content = @Content(schema = @Schema(implementation = QnAVersionResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "첨삭 링크 또는 QnA를 찾을 수 없음"),
            @ApiResponse(responseCode = "409", description = "첨삭 링크 접근 인원 초과"),
            @ApiResponse(responseCode = "410", description = "첨삭 링크 만료")
    })
    ResponseEntity<QnAVersionResponse> getQnAWithVersion(
            @Parameter(hidden = true) String userId, String shareId, Long qnAId
    );

    @Operation(summary = "첨삭 링크로 자기소개서 및 QnA ID 목록 조회", description = "첨삭 링크를 통해 자기소개서 정보와 QnA ID 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "자기소개서 및 QnA ID 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = CoverLetterAndQnAIdsResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "첨삭 링크를 찾을 수 없음"),
            @ApiResponse(responseCode = "409", description = "첨삭 링크 접근 인원 초과"),
            @ApiResponse(responseCode = "410", description = "첨삭 링크 만료")
    })
    ResponseEntity<CoverLetterAndQnAIdsResponse> getCoverLetterAndQnAIds(
            @Parameter(hidden = true) String userId, String shareId
    );
}
