package com.jackpot.narratix.domain.controller.api;

import com.jackpot.narratix.domain.controller.request.PresignedUrlRequest;
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

}
