package com.jackpot.narratix.domain.repository.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QnACountProjection {

    private final Long coverLetterId;
    private final Long count;
}