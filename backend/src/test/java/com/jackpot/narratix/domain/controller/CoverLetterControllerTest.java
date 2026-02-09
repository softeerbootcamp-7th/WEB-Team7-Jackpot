package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.request.CreateQuestionRequest;
import com.jackpot.narratix.domain.controller.request.EditCoverLetterRequest;
import com.jackpot.narratix.domain.controller.response.CoverLettersDateRangeResponse;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.TotalCoverLetterCountResponse;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.service.CoverLetterService;
import com.jackpot.narratix.global.auth.AuthConstants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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

    @ParameterizedTest
    @MethodSource("provideInvalidCreateCoverLetterRequests")
    @DisplayName("자기소개서 생성 시 필수 필드가 null이면 400 Bad Request 반환")
    void createCoverLetter_RequiredFieldNull_BadRequest(CreateCoverLetterRequest request) throws Exception {
        // when & then
        mockMvc.perform(post("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    private static Stream<Arguments> provideInvalidCreateCoverLetterRequests() {
        CreateQuestionRequest validQuestion = new CreateQuestionRequest(
                "지원동기를 작성해주세요.",
                QuestionCategoryType.MOTIVATION.getDescription()
        );
        LocalDate validDate = LocalDate.of(2024, 12, 31);

        return Stream.of(
                Arguments.of(new CreateCoverLetterRequest(null, 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", validDate, List.of(validQuestion))),
                Arguments.of(new CreateCoverLetterRequest("현대자동차", 2024, null, "백엔드 개발자", validDate, List.of(validQuestion))),
                Arguments.of(new CreateCoverLetterRequest("현대자동차", 2024, ApplyHalfType.FIRST_HALF, null, validDate, List.of(validQuestion)))
        );
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

    @ParameterizedTest
    @MethodSource("provideInvalidQuestionsCoverLetterRequests")
    @DisplayName("자기소개서 생성 시 질문이 유효하지 않으면 400 Bad Request 반환")
    void createCoverLetter_InvalidQuestions_BadRequest(CreateCoverLetterRequest request) throws Exception {
        // when & then
        mockMvc.perform(post("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    private static Stream<Arguments> provideInvalidQuestionsCoverLetterRequests() {
        LocalDate validDate = LocalDate.of(2024, 12, 31);

        // 질문이 11개인 리스트 생성
        List<CreateQuestionRequest> elevenQuestions = new ArrayList<>();
        for (int i = 1; i <= 11; i++) {
            elevenQuestions.add(new CreateQuestionRequest(
                    "지원동기를 작성해주세요.",
                    QuestionCategoryType.MOTIVATION.getDescription()
            ));
        }

        return Stream.of(
                Arguments.of(new CreateCoverLetterRequest("현대자동차", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", validDate, List.of())),
                Arguments.of(new CreateCoverLetterRequest("현대자동차", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", validDate, elevenQuestions)),
                Arguments.of(new CreateCoverLetterRequest("현대자동차", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", validDate, null))
        );
    }

    @Test
    @DisplayName("자기소개서 단건 조회시 id가 null이면 400 Bad Request 반환")
    void findCoverLetterById_idIsNull_BadRequest() throws Exception {
        mockMvc.perform(get("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    @DisplayName("자기소개서 단건 조회 성공")
    void findCoverLetterById() throws Exception {
        // given
        given(coverLetterService.findCoverLetterById(any(), any()))
                .willReturn(null);

        // when & then
        mockMvc.perform(get("/api/v1/coverletter/1")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("자기소개서 삭제 성공")
    void deleteCoverLetterById_Success() throws Exception {
        // given
        Long coverLetterId = 1L;

        // when & then
        mockMvc.perform(delete("/api/v1/coverletter/" + coverLetterId)
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("자기소개서 삭제 시 coverLetterId가 전달되지 않으면 400 Bad Request 반환")
    void deleteCoverLetterById_CoverLetterIdNull_BadRequest() throws Exception {
        // when & then
        mockMvc.perform(delete("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    @DisplayName("자기소개서 총 개수 조회 성공")
    void getTotalCoverLetterCount_Success() throws Exception {
        // given
        LocalDate date = LocalDate.of(2024, 12, 31);
        TotalCoverLetterCountResponse response = TotalCoverLetterCountResponse.builder()
                .coverLetterCount(5)
                .qnaCount(12)
                .seasonCoverLetterCount(3)
                .build();

        given(coverLetterService.getTotalCoverLetterCount(any(), any(LocalDate.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(get("/api/v1/coverletter/count")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .param("date", date.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.coverLetterCount").value(5))
                .andExpect(jsonPath("$.qnaCount").value(12))
                .andExpect(jsonPath("$.seasonCoverLetterCount").value(3));
    }

    @Test
    @DisplayName("자기소개서 총 개수 조회 시 date가 없으면 400 Bad Request 반환")
    void getTotalCoverLetterCount_DateMissing_BadRequest() throws Exception {
        // when & then
        mockMvc.perform(get("/api/v1/coverletter/count")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("유효한 데이터로 자기소개서 수정 성공 (마감일 포함)")
    void editCoverLetter_WithDeadline_Success() throws Exception {
        // given
        EditCoverLetterRequest request = new EditCoverLetterRequest(
                1L,
                "현대자동차",
                2024,
                ApplyHalfType.FIRST_HALF,
                "백엔드 개발자",
                LocalDate.of(2024, 12, 31)
        );

        // when & then
        mockMvc.perform(put("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("유효한 데이터로 자기소개서 수정 성공 (마감일 null)")
    void editCoverLetter_WithoutDeadline_Success() throws Exception {
        // given
        EditCoverLetterRequest request = new EditCoverLetterRequest(
                1L,
                "현대자동차",
                2024,
                ApplyHalfType.SECOND_HALF,
                "프론트엔드 개발자",
                null
        );

        // when & then
        mockMvc.perform(put("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @ParameterizedTest
    @MethodSource("provideInvalidEditCoverLetterRequests")
    @DisplayName("자기소개서 수정 시 필수 필드가 null이면 400 Bad Request 반환")
    void editCoverLetter_RequiredFieldNull_BadRequest(EditCoverLetterRequest request) throws Exception {
        // when & then
        mockMvc.perform(put("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    private static Stream<Arguments> provideInvalidEditCoverLetterRequests() {
        LocalDate validDate = LocalDate.of(2024, 12, 31);
        return Stream.of(
                Arguments.of(new EditCoverLetterRequest(null, "현대자동차", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", validDate)),
                Arguments.of(new EditCoverLetterRequest(1L, null, 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", validDate)),
                Arguments.of(new EditCoverLetterRequest(1L, "현대자동차", null, ApplyHalfType.FIRST_HALF, "백엔드 개발자", validDate)),
                Arguments.of(new EditCoverLetterRequest(1L, "현대자동차", 2024, null, "백엔드 개발자", validDate)),
                Arguments.of(new EditCoverLetterRequest(1L, "현대자동차", 2024, ApplyHalfType.FIRST_HALF, null, validDate))
        );
    }

    @Test
    @DisplayName("날짜 범위로 자기소개서 리스트 조회 성공")
    void getAllCoverLetterByDate_Success() throws Exception {
        // given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Integer size = 10;

        CoverLettersDateRangeResponse.CoverLetterResponse coverLetter1 =
                new CoverLettersDateRangeResponse.CoverLetterResponse(
                        1L,
                        "현대자동차",
                        2024,
                        ApplyHalfType.FIRST_HALF,
                        "백엔드 개발자",
                        LocalDate.of(2024, 6, 30),
                        3L
                );

        CoverLettersDateRangeResponse.CoverLetterResponse coverLetter2 =
                new CoverLettersDateRangeResponse.CoverLetterResponse(
                        2L,
                        "삼성전자",
                        2024,
                        ApplyHalfType.SECOND_HALF,
                        "프론트엔드 개발자",
                        LocalDate.of(2024, 12, 15),
                        5L
                );

        CoverLettersDateRangeResponse response = new CoverLettersDateRangeResponse(
                2L,
                List.of(coverLetter1, coverLetter2)
        );

        given(coverLetterService.getAllCoverLetterByDate(any(), any(LocalDate.class), any(LocalDate.class), any(Integer.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(get("/api/v1/coverletter/all")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .param("startDate", startDate.toString())
                        .param("endDate", endDate.toString())
                        .param("size", size.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(2))
                .andExpect(jsonPath("$.coverLetters").isArray())
                .andExpect(jsonPath("$.coverLetters.length()").value(2))
                .andExpect(jsonPath("$.coverLetters[0].coverLetterId").value(1))
                .andExpect(jsonPath("$.coverLetters[0].companyName").value("현대자동차"))
                .andExpect(jsonPath("$.coverLetters[0].applyYear").value(2024))
                .andExpect(jsonPath("$.coverLetters[0].applyHalf").value("FIRST_HALF"))
                .andExpect(jsonPath("$.coverLetters[0].jobPosition").value("백엔드 개발자"))
                .andExpect(jsonPath("$.coverLetters[0].questionCount").value(3))
                .andExpect(jsonPath("$.coverLetters[1].coverLetterId").value(2))
                .andExpect(jsonPath("$.coverLetters[1].companyName").value("삼성전자"))
                .andExpect(jsonPath("$.coverLetters[1].questionCount").value(5));
    }

    @Test
    @DisplayName("날짜 범위로 자기소개서 리스트 조회 시 결과가 없을 때 빈 리스트 반환")
    void getAllCoverLetterByDate_EmptyResult_Success() throws Exception {
        // given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Integer size = 10;

        CoverLettersDateRangeResponse response = new CoverLettersDateRangeResponse(0L, List.of());

        given(coverLetterService.getAllCoverLetterByDate(any(), any(LocalDate.class), any(LocalDate.class), any(Integer.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(get("/api/v1/coverletter/all")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .param("startDate", startDate.toString())
                        .param("endDate", endDate.toString())
                        .param("size", size.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(0))
                .andExpect(jsonPath("$.coverLetters").isArray())
                .andExpect(jsonPath("$.coverLetters.length()").value(0));
    }

    @ParameterizedTest
    @MethodSource("provideInvalidParametersForGetAllCoverLetterByDate")
    @DisplayName("날짜 범위로 자기소개서 리스트 조회 시 필수 파라미터가 누락되거나 잘못되면 400 Bad Request 반환")
    void getAllCoverLetterByDate_InvalidParameters_BadRequest(
            String startDate, String endDate, String size
    ) throws Exception {
        // when & then
        mockMvc.perform(get("/api/v1/coverletter/all")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .param("startDate", startDate != null ? startDate : "")
                        .param("endDate", endDate != null ? endDate : "")
                        .param("size", size != null ? size : ""))
                .andExpect(status().isBadRequest());
    }

    private static Stream<Arguments> provideInvalidParametersForGetAllCoverLetterByDate() {
        return Stream.of(
                Arguments.of(null, "2024-12-31", "10"),  // startDate 누락
                Arguments.of("2024-01-01", null, "10"),  // endDate 누락
                Arguments.of("2024-01-01", "2024-12-31", null),  // size 누락
                Arguments.of("2024/01/01", "2024-12-31", "10"),  // 잘못된 날짜 포맷 (startDate)
                Arguments.of("2024-01-01", "2024/12/31", "10")   // 잘못된 날짜 포맷 (endDate)
        );
    }
}