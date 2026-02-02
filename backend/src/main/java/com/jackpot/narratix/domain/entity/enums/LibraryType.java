package com.jackpot.narratix.domain.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum LibraryType {

    COMPANY("기업"),
    QUESTION("문항");

    private final String description;
}
