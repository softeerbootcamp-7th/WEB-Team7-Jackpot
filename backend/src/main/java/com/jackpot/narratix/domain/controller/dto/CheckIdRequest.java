package com.jackpot.narratix.domain.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CheckIdRequest {

    @NotBlank(message = "아이디는 필수 입력 항목입니다.")
    @Size(min = 6, max = 12, message = "아이디는 6자 이상 12자 이하여야 합니다.")
    @Pattern(regexp = "^[a-z0-9]+$", message = "아이디는 영어 소문자와 숫자만 사용할 수 있습니다.")
    private String userId;
}
