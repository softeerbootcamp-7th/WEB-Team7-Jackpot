package com.jackpot.narratix.domain.controller.request;

import lombok.AllArgsConstructor;

@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public class CreateQuestionRequest {

    private final String question;

    private final String category;

}
