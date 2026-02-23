package com.jackpot.narratix.domain.controller;

import com.jackpot.narratix.domain.controller.request.CoverLetterAndQnAEditRequest;
import com.jackpot.narratix.domain.controller.request.CoverLettersSaveRequest;
import com.jackpot.narratix.domain.controller.request.CreateCoverLetterRequest;
import com.jackpot.narratix.domain.controller.request.CreateQuestionRequest;
import com.jackpot.narratix.domain.controller.response.CreateCoverLetterResponse;
import com.jackpot.narratix.domain.controller.response.FilteredCoverLettersResponse;
import com.jackpot.narratix.domain.controller.response.SavedCoverLetterCountResponse;
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
                Arguments.of(new CreateCoverLetterRequest(null, 2024, ApplyHalfType.FIRST_HALF, "백엔드", validDate, List.of(validQuestion))),
                Arguments.of(new CreateCoverLetterRequest("", 2024, ApplyHalfType.FIRST_HALF, "백엔드", validDate, List.of(validQuestion))),
                Arguments.of(new CreateCoverLetterRequest("  ", 2024, ApplyHalfType.FIRST_HALF, "백엔드", validDate, List.of(validQuestion))),

                Arguments.of(new CreateCoverLetterRequest("현대차", 2024, ApplyHalfType.FIRST_HALF, null, validDate, List.of(validQuestion))),
                Arguments.of(new CreateCoverLetterRequest("현대차", 2024, ApplyHalfType.FIRST_HALF, "", validDate, List.of(validQuestion))),
                Arguments.of(new CreateCoverLetterRequest("현대차", 2024, ApplyHalfType.FIRST_HALF, "  ", validDate, List.of(validQuestion))),

                Arguments.of(new CreateCoverLetterRequest("현대차", 2024, null, "백엔드", validDate, List.of(validQuestion)))
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
        CoverLetterAndQnAEditRequest request = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        1L, "현대자동차", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", LocalDate.of(2024, 12, 31)
                ),
                List.of()
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
        CoverLetterAndQnAEditRequest request = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        1L, "현대자동차", 2024, ApplyHalfType.SECOND_HALF, "프론트엔드 개발자", null
                ),
                List.of()
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
    void editCoverLetter_RequiredFieldNull_BadRequest(CoverLetterAndQnAEditRequest request) throws Exception {
        // when & then
        mockMvc.perform(put("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    private static Stream<Arguments> provideInvalidEditCoverLetterRequests() {
        LocalDate validDate = LocalDate.of(2024, 12, 31);
        CoverLetterAndQnAEditRequest.CoverLetterEditRequest validCoverLetter =
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(1L, "현대자동차", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", validDate);
        return Stream.of(
                Arguments.of(new CoverLetterAndQnAEditRequest(new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(null, "현대자동차", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", validDate), List.of())),
                Arguments.of(new CoverLetterAndQnAEditRequest(new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(1L, null, 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", validDate), List.of())),
                Arguments.of(new CoverLetterAndQnAEditRequest(new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(1L, "현대자동차", null, ApplyHalfType.FIRST_HALF, "백엔드 개발자", validDate), List.of())),
                Arguments.of(new CoverLetterAndQnAEditRequest(new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(1L, "현대자동차", 2024, null, "백엔드 개발자", validDate), List.of())),
                Arguments.of(new CoverLetterAndQnAEditRequest(new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(1L, "현대자동차", 2024, ApplyHalfType.FIRST_HALF, null, validDate), List.of())),
                // QnA question null
                Arguments.of(new CoverLetterAndQnAEditRequest(validCoverLetter,
                        List.of(new CoverLetterAndQnAEditRequest.QnAEditRequest(10L, null, QuestionCategoryType.MOTIVATION)))),
                // QnA category null
                Arguments.of(new CoverLetterAndQnAEditRequest(validCoverLetter,
                        List.of(new CoverLetterAndQnAEditRequest.QnAEditRequest(10L, "질문", null))))
        );
    }

    @Test
    @DisplayName("필터링된 자기소개서 리스트 조회 성공")
    void getAllCoverLetterByFilter_Success() throws Exception {
        // given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Integer size = 10;

        FilteredCoverLettersResponse.CoverLetterResponse coverLetter1 =
                new FilteredCoverLettersResponse.CoverLetterResponse(
                        1L,
                        "현대자동차",
                        2024,
                        ApplyHalfType.FIRST_HALF,
                        "백엔드 개발자",
                        LocalDate.of(2024, 6, 30),
                        3L
                );

        FilteredCoverLettersResponse.CoverLetterResponse coverLetter2 =
                new FilteredCoverLettersResponse.CoverLetterResponse(
                        2L,
                        "삼성전자",
                        2024,
                        ApplyHalfType.SECOND_HALF,
                        "프론트엔드 개발자",
                        LocalDate.of(2024, 12, 15),
                        5L
                );

        FilteredCoverLettersResponse response = new FilteredCoverLettersResponse(
                2L,
                List.of(coverLetter1, coverLetter2),
                false
        );

        given(coverLetterService.getAllCoverLetterByFilter(any(), any()))
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
                .andExpect(jsonPath("$.coverLetters[1].questionCount").value(5))
                .andExpect(jsonPath("$.hasNext").value(false));
    }

    @Test
    @DisplayName("필터링된 자기소개서 리스트 조회 시 결과가 없을 때 빈 리스트 반환")
    void getAllCoverLetterByFilter_EmptyResult_Success() throws Exception {
        // given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Integer size = 10;

        FilteredCoverLettersResponse response = new FilteredCoverLettersResponse(0L, List.of(), false);

        given(coverLetterService.getAllCoverLetterByFilter(any(), any()))
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
                .andExpect(jsonPath("$.coverLetters.length()").value(0))
                .andExpect(jsonPath("$.hasNext").value(false));
    }

    @ParameterizedTest
    @MethodSource("provideInvalidParametersForGetAllCoverLetterByFilter")
    @DisplayName("필터링된 자기소개서 리스트 조회 시 필수 파라미터가 누락되거나 잘못되면 400 Bad Request 반환")
    void getAllCoverLetterByFilter_InvalidParameters_BadRequest(
            String startDate, String endDate, String size
    ) throws Exception {
        // when & then
        mockMvc.perform(get("/api/v1/coverletter/all")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .param("startDate", startDate != null ? startDate : "")
                        .param("endDate", endDate != null ? endDate : "")
                        .param("size", size))
                .andExpect(status().isBadRequest());
    }

    private static Stream<Arguments> provideInvalidParametersForGetAllCoverLetterByFilter() {
        return Stream.of(
                Arguments.of("2024-01-01", "2024-12-31", null),  // size 누락
                Arguments.of("2024/01/01", "2024-12-31", "10"),  // 잘못된 날짜 포맷 (startDate)
                Arguments.of("2024-01-01", "2024/12/31", "10")   // 잘못된 날짜 포맷 (endDate)
        );
    }

    @Test
    @DisplayName("업로드된 자기소개서 저장 성공")
    void saveUploadedCoverLetter_Success() throws Exception {
        // given
        String uploadJobId = "01JPZTEST001";

        CoverLettersSaveRequest request = new CoverLettersSaveRequest(
                List.of(
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                                        "현대자동차", "백엔드 개발자", 2024, ApplyHalfType.FIRST_HALF, LocalDate.of(2024, 12, 31)
                                ),
                                List.of(
                                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.QnASaveRequest(
                                                "지원동기를 입력해주세요.", "저는 개발자입니다.", QuestionCategoryType.MOTIVATION
                                        )
                                )
                        )
                )
        );

        given(coverLetterService.saveCoverLetterAndDeleteJob(any(), any(), any()))
                .willReturn(new SavedCoverLetterCountResponse(1));

        // when & then
        mockMvc.perform(post("/api/v1/coverletter/upload/" + uploadJobId)
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.savedCoverLetterCount").value(1));
    }

    @Test
    @DisplayName("업로드된 자기소개서 3개 저장 성공")
    void saveUploadedCoverLetter_3개_저장_성공() throws Exception {
        // given
        String uploadJobId = "01JPZTEST001";

        CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.QnASaveRequest qnaReq =
                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.QnASaveRequest(
                        "지원동기를 입력해주세요.", "저는 개발자입니다.", QuestionCategoryType.MOTIVATION
                );

        CoverLettersSaveRequest request = new CoverLettersSaveRequest(
                List.of(
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                                        "현대자동차", "백엔드 개발자", 2024, ApplyHalfType.FIRST_HALF, LocalDate.of(2024, 6, 30)
                                ),
                                List.of(qnaReq)
                        ),
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                                        "삼성전자", "프론트엔드 개발자", 2024, ApplyHalfType.SECOND_HALF, LocalDate.of(2024, 12, 31)
                                ),
                                List.of(qnaReq)
                        ),
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                                        "네이버", "백엔드 개발자", 2024, ApplyHalfType.FIRST_HALF, LocalDate.of(2024, 5, 31)
                                ),
                                List.of(qnaReq)
                        )
                )
        );

        given(coverLetterService.saveCoverLetterAndDeleteJob(any(), any(), any()))
                .willReturn(new SavedCoverLetterCountResponse(3));

        // when & then
        mockMvc.perform(post("/api/v1/coverletter/upload/" + uploadJobId)
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.savedCoverLetterCount").value(3));
    }

    @Test
    @DisplayName("업로드된 자기소개서 저장 시 coverLetters가 null이면 400 Bad Request 반환")
    void saveUploadedCoverLetter_CoverLettersNull_BadRequest() throws Exception {
        // given
        String uploadJobId = "01JPZTEST001";
        CoverLettersSaveRequest request = new CoverLettersSaveRequest(null);

        // when & then
        mockMvc.perform(post("/api/v1/coverletter/upload/" + uploadJobId)
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @MethodSource("provideInvalidSaveUploadedCoverLetterRequests")
    @DisplayName("업로드된 자기소개서 저장 시 유효성 검증 실패하면 400 Bad Request 반환")
    void saveUploadedCoverLetter_ValidationFailed_BadRequest(CoverLettersSaveRequest request) throws Exception {
        // given
        String uploadJobId = "01JPZTEST001";

        // when & then
        mockMvc.perform(post("/api/v1/coverletter/upload/" + uploadJobId)
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    private static Stream<Arguments> provideInvalidSaveUploadedCoverLetterRequests() {
        CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.QnASaveRequest validQna =
                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.QnASaveRequest(
                        "지원동기를 입력해주세요.", "저는 개발자입니다.", QuestionCategoryType.MOTIVATION
                );
        CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest validCoverLetterReq =
                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                        "현대자동차", "백엔드 개발자", 2024, ApplyHalfType.FIRST_HALF, LocalDate.of(2024, 12, 31)
                );

        // 11개의 QnA 리스트 (최대 10개 초과)
        List<CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.QnASaveRequest> elevenQnas =
                new ArrayList<>();
        for (int i = 0; i < 11; i++) {
            elevenQnas.add(validQna);
        }

        // 4개의 자기소개서 (최대 3개 초과)
        List<CoverLettersSaveRequest.CoverLetterAndQnASaveRequest> fourCoverLetters =
                new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            fourCoverLetters.add(new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                    validCoverLetterReq, List.of(validQna)
            ));
        }

        return Stream.of(
                // coverLetters 빈 리스트 (min 1)
                Arguments.of(new CoverLettersSaveRequest(List.of())),
                // coverLetters 4개 초과 (max 3)
                Arguments.of(new CoverLettersSaveRequest(fourCoverLetters)),
                // companyName null
                Arguments.of(new CoverLettersSaveRequest(List.of(
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                                        null, "백엔드 개발자", 2024, ApplyHalfType.FIRST_HALF, LocalDate.of(2024, 12, 31)
                                ),
                                List.of(validQna)
                        )
                ))),
                // jobPosition null
                Arguments.of(new CoverLettersSaveRequest(List.of(
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                                        "현대자동차", null, 2024, ApplyHalfType.FIRST_HALF, LocalDate.of(2024, 12, 31)
                                ),
                                List.of(validQna)
                        )
                ))),
                // applyHalf null
                Arguments.of(new CoverLettersSaveRequest(List.of(
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest.CoverLetterSaveRequest(
                                        "현대자동차", "백엔드 개발자", 2024, null, LocalDate.of(2024, 12, 31)
                                ),
                                List.of(validQna)
                        )
                ))),
                // qnAs 빈 리스트 (min 1)
                Arguments.of(new CoverLettersSaveRequest(List.of(
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                validCoverLetterReq,
                                List.of()
                        )
                ))),
                // qnAs 11개 초과 (max 10)
                Arguments.of(new CoverLettersSaveRequest(List.of(
                        new CoverLettersSaveRequest.CoverLetterAndQnASaveRequest(
                                validCoverLetterReq,
                                elevenQnas
                        )
                )))
        );
    }

    @Test
    @DisplayName("자기소개서 수정 성공 - 204 No Content 반환")
    void editCoverLetter_Success() throws Exception {
        // given
        CoverLetterAndQnAEditRequest request = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        1L, "수정된 기업명", 2025, ApplyHalfType.SECOND_HALF, "프론트엔드 개발자", LocalDate.of(2025, 6, 30)
                ),
                List.of(new CoverLetterAndQnAEditRequest.QnAEditRequest(10L, "지원 동기를 작성해주세요.", QuestionCategoryType.MOTIVATION))
        );

        // when & then
        mockMvc.perform(put("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("자기소개서 수정 - qnAId null인 새 문항 포함 시 204 반환")
    void editCoverLetter_새QnA추가_Success() throws Exception {
        // given
        CoverLetterAndQnAEditRequest request = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        1L, "기업명", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", null
                ),
                List.of(new CoverLetterAndQnAEditRequest.QnAEditRequest(null, "새 질문입니다.", QuestionCategoryType.VALUES))
        );

        // when & then
        mockMvc.perform(put("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("자기소개서 수정 - questions 빈 배열이면 기존 QnA 전체 삭제 - 204 반환")
    void editCoverLetter_빈questions배열_Success() throws Exception {
        // given
        CoverLetterAndQnAEditRequest request = new CoverLetterAndQnAEditRequest(
                new CoverLetterAndQnAEditRequest.CoverLetterEditRequest(
                        1L, "기업명", 2024, ApplyHalfType.FIRST_HALF, "백엔드 개발자", null
                ),
                List.of()
        );

        // when & then
        mockMvc.perform(put("/api/v1/coverletter")
                        .header(AuthConstants.AUTHORIZATION, TEST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

}