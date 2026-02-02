package com.jackpot.narratix.domain.entity.enums;

import java.util.Arrays;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public enum QuestionCategoryType {

    MOTIVATION("지원동기"),
    TEAMWORK_EXPERIENCE("협업경험"),
    VALUES("가치관"),
    JOB_SKILL("직무역량"),
    PERSONALITY("성격의 장단점"),
    FUTURE_PLAN("입사 후 포부"),
    PROBLEM_SOLVING("문제해결"),
    CAREER_GOAL("커리어 목표"),
    FAILURE_EXPERIENCE("실패경험"),
    GROWTH_PROCESS("성장과정"),
    SOCIAL_TOPIC("사회이슈"),
    OTHER("기타");

    @JsonValue
    private final String description;

    public static QuestionCategoryType fromDescription(String description) {
        return Arrays.stream(values())
                .filter(type -> type.description.equals(description))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid description: " + description));
    }
}
