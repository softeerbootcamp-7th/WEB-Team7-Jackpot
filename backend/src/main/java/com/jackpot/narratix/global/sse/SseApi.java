package com.jackpot.narratix.global.sse;

import com.jackpot.narratix.global.auth.UserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Tag(name = "SSE", description = "Server-Sent Events 실시간 알림 API")
@SecurityRequirement(name = "JWT")
public interface SseApi {

    @Operation(
            summary = "SSE 연결",
            description = "실시간 알림을 받기 위한 SSE 연결을 수립합니다. " +
                    "연결 시 초기 이벤트(init)를 수신하며, 이후 서버에서 발생하는 알림을 실시간으로 전달받습니다."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "SSE 연결 성공",
                    content = @Content(mediaType = "text/event-stream")
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "인증 실패 - 유효하지 않은 토큰"
            )
    })
    SseEmitter connect(@UserId String userId);
}
