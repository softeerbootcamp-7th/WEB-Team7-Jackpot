package com.jackpot.narratix.domain.entity.enums;

import java.time.LocalDate;

public enum ApplyHalfType {
    FIRST_HALF, SECOND_HALF;

    private static final int HALF_YEAR_BOUNDARY_MONTH = 6;

    public static ApplyHalfType calculateApplyHalfType(LocalDate date) {
        if (date.getMonthValue() <= HALF_YEAR_BOUNDARY_MONTH) return FIRST_HALF;
        return SECOND_HALF;
    }
}
