package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.request.ShareLinkActiveRequest;
import com.jackpot.narratix.domain.controller.response.ShareLinkActiveResponse;
import com.jackpot.narratix.global.auth.UserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

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
            @UserId String userId,
            @PathVariable Long coverLetterId,
            @Valid @RequestBody ShareLinkActiveRequest request
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
            @UserId String userId,
            @PathVariable Long coverLetterId
    );
}
