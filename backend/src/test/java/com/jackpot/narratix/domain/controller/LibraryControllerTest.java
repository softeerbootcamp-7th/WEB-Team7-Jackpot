package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.entity.enums.LibraryType;
import com.jackpot.narratix.domain.service.LibraryService;
import com.jackpot.narratix.global.auth.AuthConstants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class LibraryControllerTest {

    @InjectMocks
    private LibraryController libraryController;

    @Mock
    private LibraryService libraryService;

    private MockMvc mockMvc;

    private static final String TEST_USER_ID = "user1234";
    private static final String TEST_TOKEN = "Bearer test.token.here";

    @BeforeEach
    void setUp() {
        HandlerMethodArgumentResolver userIdResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(com.jackpot.narratix.global.auth.UserId.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return TEST_USER_ID;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(libraryController)
                .setCustomArgumentResolvers(userIdResolver) // 리졸버 등록
                .build();
    }

    @Test
    @DisplayName("유효한 userId와 libraryType으로 목록 조회 성공")
    void getLibraryList_Success() throws Exception {
        // given
        LibraryType type = LibraryType.COMPANY;
        List<String> mockResponse = List.of("Library Item 1", "Library Item 2");

        given(libraryService.getLibraryList(eq(TEST_USER_ID), eq(type)))
                .willReturn(mockResponse);

        // when & then
        mockMvc.perform(get("/api/v1/library/all")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .param("libraryType", type.name())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.libraries").isArray())
                .andExpect(jsonPath("$.libraries[0]").value("Library Item 1"))
                .andExpect(jsonPath("$.libraries.length()").value(2));
    }

    @Test
    @DisplayName("libraryType 파라미터가 누락된 경우 400 에러")
    void getLibraryList_MissingParam_BadRequest() throws Exception {
        // when & then
        mockMvc.perform(get("/api/v1/library/all")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("잘못된 libraryType 값이 넘어온 경우 400 에러")
    void getLibraryList_InvalidEnum_BadRequest() throws Exception {
        // when & then
        mockMvc.perform(get("/api/v1/library/all")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .param("libraryType", "INVALID_ENUM_VALUE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}