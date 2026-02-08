package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.response.NotificationsPaginationResponse;
import com.jackpot.narratix.global.auth.UserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

@Tag(name = "알림", description = "알림 관리 API")
@SecurityRequirement(name = "JWT")
public interface NotificationApi {

    @Operation(summary = "알림 목록 조회", description = "사용자의 알림 목록을 커서 기반 페이지네이션 방식으로 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = NotificationsPaginationResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/all")
    ResponseEntity<NotificationsPaginationResponse> getNotifications(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "마지막으로 조회한 알림 ID (커서 기반 페이지네이션)", required = false)
            @RequestParam(required = false) Optional<Long> lastNotificationId,
            @Parameter(description = "조회할 알림 개수", required = true, example = "20")
            @RequestParam Integer size
    );

    @Operation(summary = "알림 읽음 처리", description = "특정 알림을 읽음 상태로 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "읽음 처리 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "알림을 찾을 수 없음")
    })
    @PatchMapping("/{notificationId}/read")
    ResponseEntity<Void> markNotificationAsRead(
            @Parameter(hidden = true) @UserId String userId,
            @Parameter(description = "읽음 처리할 알림 ID", required = true, example = "1")
            @PathVariable Long notificationId
    );
}
