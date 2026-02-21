package com.jackpot.narratix.domain.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public enum ApplyHalfType {
    FIRST_HALF("상반기"),
    SECOND_HALF("하반기");

    private final String description;
    private static final int HALF_YEAR_BOUNDARY_MONTH = 6;

    public static ApplyHalfType calculateApplyHalfType(LocalDate date) {
        if (date.getMonthValue() <= HALF_YEAR_BOUNDARY_MONTH) return FIRST_HALF;
        return SECOND_HALF;
    }
}
