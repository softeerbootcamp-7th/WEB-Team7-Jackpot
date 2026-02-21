package com.jackpot.narratix.domain.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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

    private static final Map<String, QuestionCategoryType> CATEGORY_TYPE_MAP =
            Arrays.stream(values())
                    .collect(Collectors.toUnmodifiableMap(QuestionCategoryType::getDescription, Function.identity()));

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static QuestionCategoryType fromDescription(String description) {
        QuestionCategoryType type = CATEGORY_TYPE_MAP.get(description);
        if (type == null) {
            try {
                type = QuestionCategoryType.valueOf(description);
            } catch (IllegalArgumentException e) {
                throw new BaseException(GlobalErrorCode.INVALID_INPUT_VALUE);
            }
        }
        return type;
    }
}
