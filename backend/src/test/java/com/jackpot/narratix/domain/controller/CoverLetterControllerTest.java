package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.request.CreateQuestionRequest;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.service.CoverLetterService;
import com.jackpot.narratix.global.auth.AuthConstants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class CoverLetterControllerTest {

    @InjectMocks
    private CoverLetterController coverLetterController;

    @Mock
    private CoverLetterService coverLetterService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;

    private static final String TEST_TOKEN = "Bearer test.token.here";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(coverLetterController).build();
    }

    @Test
    @DisplayName("유효한 데이터로 자기소개서 생성 성공")
    void createCoverLetter_Success() throws Exception {
        // given
        CreateQuestionRequest questionRequest = new CreateQuestionRequest(
                "지원동기를 작성해주세요.",
                QuestionCategoryType.MOTIVATION.getDescription()
        );

        CreateCoverLetterRequest request = new CreateCoverLetterRequest(
                "현대자동차",
                2024,
                ApplyHalfType.FIRST_HALF,
                "백엔드 개발자",
                LocalDate.of(2024, 12, 31),
                List.of(questionRequest)
        );

        given(coverLetterService.createNewCoverLetter(any(), any(CreateCoverLetterRequest.class)))
                .willReturn(new CreateCoverLetterResponse(0L));

        // when & then
        mockMvc.perform(post("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.coverLetterId").isNumber());
    }

    @Test
    @DisplayName("기업명이 null이면 400 Bad Request 반환")
    void createCoverLetter_CompanyNameNull_BadRequest() throws Exception {
        // given
        CreateQuestionRequest questionRequest = new CreateQuestionRequest(
                "지원동기를 작성해주세요.",
                QuestionCategoryType.MOTIVATION.getDescription()
        );

        CreateCoverLetterRequest request = new CreateCoverLetterRequest(
                null,  // companyName이 null
                2024,
                ApplyHalfType.FIRST_HALF,
                "백엔드 개발자",
                LocalDate.of(2024, 12, 31),
                List.of(questionRequest)
        );

        // When & Then
        mockMvc.perform(post("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("채용 분기가 null이면 400 Bad Request 반환")
    void createCoverLetter_ApplyHalfNull_BadRequest() throws Exception {
        // given: 채용 분기가 null
        CreateQuestionRequest questionRequest = new CreateQuestionRequest(
                "지원동기를 작성해주세요.",
                QuestionCategoryType.MOTIVATION.getDescription()
        );

        CreateCoverLetterRequest request = new CreateCoverLetterRequest(
                "현대자동차",
                2024,
                null,  // applyHalf가 null
                "백엔드 개발자",
                LocalDate.of(2024, 12, 31),
                List.of(questionRequest)
        );

        // When & Then
        mockMvc.perform(post("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("직무명이 null이면 400 Bad Request 반환")
    void createCoverLetter_JobPositionNull_BadRequest() throws Exception {
        // Given: 직무명이 null
        CreateQuestionRequest questionRequest = new CreateQuestionRequest(
                "지원동기를 작성해주세요.",
                QuestionCategoryType.MOTIVATION.getDescription()
        );

        CreateCoverLetterRequest request = new CreateCoverLetterRequest(
                "현대자동차",
                2024,
                ApplyHalfType.FIRST_HALF,
                null,  // jobPosition이 null
                LocalDate.of(2024, 12, 31),
                List.of(questionRequest)
        );

        // When & Then
        mockMvc.perform(post("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("마감일이 null이어도 정상적으로 생성됨")
    void createCoverLetter_DeadlineNull_Success() throws Exception {
        // Given: 마감일이 null
        CreateQuestionRequest questionRequest = new CreateQuestionRequest(
                "지원동기를 작성해주세요.",
                QuestionCategoryType.MOTIVATION.getDescription()
        );

        CreateCoverLetterRequest request = new CreateCoverLetterRequest(
                "현대자동차",
                2024,
                ApplyHalfType.FIRST_HALF,
                "백엔드 개발자",
                null,  // deadline이 null
                List.of(questionRequest)
        );

        given(coverLetterService.createNewCoverLetter(any(), any(CreateCoverLetterRequest.class)))
                .willReturn(new CreateCoverLetterResponse(0L));

        // When & Then
        mockMvc.perform(post("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.coverLetterId").isNumber());
    }

    @Test
    @DisplayName("질문이 1개일 때 정상적으로 생성됨")
    void createCoverLetter_OneQuestion_Success() throws Exception {
        // Given: 질문이 1개
        CreateQuestionRequest questionRequest = new CreateQuestionRequest(
                "지원동기를 작성해주세요.",
                QuestionCategoryType.MOTIVATION.getDescription()
        );

        CreateCoverLetterRequest request = new CreateCoverLetterRequest(
                "현대자동차",
                2024,
                ApplyHalfType.FIRST_HALF,
                "백엔드 개발자",
                LocalDate.of(2024, 12, 31),
                List.of(questionRequest)
        );

        // When & Then
        mockMvc.perform(post("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("질문이 3개일 때 정상적으로 생성됨")
    void createCoverLetter_ThreeQuestions_Success() throws Exception {
        // Given: 질문이 3개
        CreateQuestionRequest question1 = new CreateQuestionRequest(
                "지원동기를 작성해주세요.",
                QuestionCategoryType.MOTIVATION.getDescription()
        );
        CreateQuestionRequest question2 = new CreateQuestionRequest(
                "협업 경험을 작성해주세요.",
                QuestionCategoryType.TEAMWORK_EXPERIENCE.getDescription()
        );
        CreateQuestionRequest question3 = new CreateQuestionRequest(
                "가치관을 작성해주세요.",
                QuestionCategoryType.VALUES.getDescription()
        );

        CreateCoverLetterRequest request = new CreateCoverLetterRequest(
                "현대자동차",
                2024,
                ApplyHalfType.FIRST_HALF,
                "백엔드 개발자",
                LocalDate.of(2024, 12, 31),
                List.of(question1, question2, question3)
        );

        // When & Then
        mockMvc.perform(post("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("질문이 0개일 때 400 Bad Request 반환")
    void createCoverLetter_NoQuestions_BadRequest() throws Exception {
        // Given: 질문이 0개
        CreateCoverLetterRequest request = new CreateCoverLetterRequest(
                "현대자동차",
                2024,
                ApplyHalfType.FIRST_HALF,
                "백엔드 개발자",
                LocalDate.of(2024, 12, 31),
                List.of()  // 빈 리스트
        );

        // When & Then
        mockMvc.perform(post("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("질문이 null일 때 400 Bad Request 반환")
    void createCoverLetter_QuestionsNull_BadRequest() throws Exception {
        // Given: questions가 null
        CreateCoverLetterRequest request = new CreateCoverLetterRequest(
                "현대자동차",
                2024,
                ApplyHalfType.FIRST_HALF,
                "백엔드 개발자",
                LocalDate.of(2024, 12, 31),
                null  // questions가 null
        );

        // When & Then
        mockMvc.perform(post("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("자기소개서 삭제 성공")
    void deleteCoverLetterById_Success() throws Exception {
        // given
        Long coverLetterId = 1L;

        // when & then
        mockMvc.perform(delete("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .param("coverLetterId", String.valueOf(coverLetterId)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("자기소개서 삭제 시 coverLetterId가 전달되지 않으면 400 Bad Request 반환")
    void deleteCoverLetterById_CoverLetterIdNull_BadRequest() throws Exception {
        // when & then
        mockMvc.perform(delete("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN))
                .andExpect(status().isBadRequest());
    }
}