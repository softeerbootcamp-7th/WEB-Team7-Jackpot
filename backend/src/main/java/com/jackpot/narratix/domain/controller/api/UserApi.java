package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.response.UserNicknameResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

@Tag(name = "사용자", description = "사용자 정보 관련 API")
@SecurityRequirement(name = "JWT")
public interface UserApi {

    @Operation(summary = "닉네임 조회", description = "로그인한 사용자의 닉네임을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "닉네임 조회 성공",
                    content = @Content(schema = @Schema(implementation = UserNicknameResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    ResponseEntity<UserNicknameResponse> getNickname(@Parameter(hidden = true) String userId);
}