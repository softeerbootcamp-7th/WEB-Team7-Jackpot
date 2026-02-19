package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.request.TextUpdateRequest;
import com.jackpot.narratix.domain.controller.response.ReviewsGetResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.entity.enums.ReviewRoleType;
import com.jackpot.narratix.domain.event.ReviewCreatedEvent;
import com.jackpot.narratix.domain.event.ReviewDeleteEvent;
import com.jackpot.narratix.domain.event.ReviewEditEvent;
import com.jackpot.narratix.domain.event.TextReplaceAllEvent;
import com.jackpot.narratix.domain.exception.ReviewErrorCode;
import com.jackpot.narratix.domain.fixture.CoverLetterFixture;
import com.jackpot.narratix.domain.fixture.QnAFixture;
import com.jackpot.narratix.domain.fixture.ReviewFixture;
import com.jackpot.narratix.domain.fixture.UserFixture;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ReviewRepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @InjectMocks
    private ReviewService reviewService;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private QnARepository qnARepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private ShareLinkSessionRegistry shareLinkSessionRegistry;

    @Mock
    private TextDeltaService textDeltaService;

    @Mock
    private OTTransformer otTransformer;

    // ─────────────────────────────────────────────────────────────
    // createReview
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("리뷰 생성 성공 - reviewerVersion == currentVersion (OT 변환 불필요)")
    void createReview_Success_SameVersion() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;
        Long coverLetterId = 1L;
        String originText = "원본 텍스트";  // length = 6

        ReviewCreateRequest request = new ReviewCreateRequest(
                0L,     // version == qnA.version
                0L,     // startIdx
                6L,     // endIdx
                originText,
                "수정 제안 텍스트",
                "피드백 코멘트"
        );

        Review savedReview = ReviewFixture.builder()
                .id(1L)
                .reviewerId(reviewerId)
                .qnaId(qnaId)
                .originText(originText)
                .suggest(request.suggest())
                .comment(request.comment())
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId)
                .userId(writerId)
                .companyName("테스트기업")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId, coverLetter, writerId, "지원동기는 무엇인가요?", QuestionCategoryType.MOTIVATION
        );
        ReflectionTestUtils.setField(qnA, "answer", originText);  // answer = "원본 텍스트"
        // qnA.version 기본값 = 0L → reviewerVersion(0) == currentVersion(0)

        given(qnARepository.findByIdOrElseThrow(qnaId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(reviewRepository.save(any(Review.class))).willReturn(savedReview);
        doNothing().when(notificationService).sendFeedbackNotificationToWriter(any(), any(), any(), any(), any());

        // when
        reviewService.createReview(reviewerId, qnaId, request);

        // then
        verify(textDeltaService, times(1)).flushToDb(qnaId);
        verify(otTransformer, never()).transformRange(anyInt(), anyInt(), any());
        verify(reviewRepository, times(1)).save(any(Review.class));
        verify(eventPublisher, times(1)).publishEvent(any(ReviewCreatedEvent.class));
        verify(eventPublisher, times(1)).publishEvent(any(TextReplaceAllEvent.class));
        verify(notificationService, times(1))
                .sendFeedbackNotificationToWriter(reviewerId, writerId, "테스트기업 2024 상반기", qnaId, originText);
    }

    @Test
    @DisplayName("리뷰 생성 성공 - reviewerVersion < currentVersion (OT 변환 적용)")
    void createReview_Success_WithOtTransform() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;
        Long coverLetterId = 1L;
        String originText = "원본";  // length = 2

        // Reviewer가 version=5 기준으로 선택, server는 version=6
        ReviewCreateRequest request = new ReviewCreateRequest(
                5L,     // reviewerVersion
                10L,    // Reviewer 기준 startIdx
                12L,    // Reviewer 기준 endIdx
                originText,
                "수정 제안",
                "코멘트"
        );

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId)
                .userId(writerId)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );
        // server version=6, answer에서 OT 변환 후 [3, 5)에 originText가 위치
        ReflectionTestUtils.setField(qnA, "version", 6L);
        ReflectionTestUtils.setField(qnA, "answer", "AB" + originText + "CDEF");  // "AB원본CDEF"

        // OT 결과: transformedStart=2, transformedEnd=4
        List<TextUpdateRequest> otDeltas = List.of(
                new TextUpdateRequest(5L, 0, 0, "AB")  // version=5인 델타
        );

        Review savedReview = ReviewFixture.builder()
                .id(1L)
                .reviewerId(reviewerId)
                .qnaId(qnaId)
                .originText(originText)
                .build();

        given(qnARepository.findByIdOrElseThrow(qnaId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(textDeltaService.getOtDeltasSince(qnaId, 5L)).willReturn(otDeltas);
        given(otTransformer.transformRange(10, 12, otDeltas)).willReturn(new int[]{2, 4});
        given(reviewRepository.save(any(Review.class))).willReturn(savedReview);
        doNothing().when(notificationService).sendFeedbackNotificationToWriter(any(), any(), any(), any(), any());

        // when
        reviewService.createReview(reviewerId, qnaId, request);

        // then
        verify(textDeltaService, times(1)).flushToDb(qnaId);
        verify(textDeltaService, times(1)).getOtDeltasSince(qnaId, 5L);
        verify(otTransformer, times(1)).transformRange(10, 12, otDeltas);
        verify(reviewRepository, times(1)).save(any(Review.class));
        verify(eventPublisher, times(1)).publishEvent(any(ReviewCreatedEvent.class));
        verify(eventPublisher, times(1)).publishEvent(any(TextReplaceAllEvent.class));
    }

    @Test
    @DisplayName("리뷰 생성 성공 - answer에 마커 ⟦r:{id}⟧...⟦/r⟧가 삽입된다")
    void createReview_Success_MarkerInsertedIntoAnswer() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;
        Long coverLetterId = 1L;
        String originText = "원본";

        ReviewCreateRequest request = new ReviewCreateRequest(0L, 2L, 4L, originText, "제안", "코멘트");

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );
        ReflectionTestUtils.setField(qnA, "answer", "AB원본CD");

        Review savedReview = ReviewFixture.builder()
                .id(99L)
                .reviewerId(reviewerId)
                .qnaId(qnaId)
                .originText(originText)
                .build();

        given(qnARepository.findByIdOrElseThrow(qnaId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(reviewRepository.save(any(Review.class))).willReturn(savedReview);
        doNothing().when(notificationService).sendFeedbackNotificationToWriter(any(), any(), any(), any(), any());

        // when
        reviewService.createReview(reviewerId, qnaId, request);

        // then
        assertThat(qnA.getAnswer()).isEqualTo("AB⟦r:99⟧원본⟦/r⟧CD");
    }

    @Test
    @DisplayName("리뷰 생성 실패 - REVIEWER로 웹소켓에 연결되어 있지 않으면 FORBIDDEN 에러 발생")
    void createReview_Fail_NotConnectedAsReviewer() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;
        Long coverLetterId = 1L;

        ReviewCreateRequest request = new ReviewCreateRequest(
                1L, 0L, 100L, "원본 텍스트", "수정 제안 텍스트", "피드백 코멘트"
        );

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId, coverLetter, writerId, "지원동기는 무엇인가요?", QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(qnaId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> reviewService.createReview(reviewerId, qnaId, request))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(reviewRepository, never()).save(any());
        verify(textDeltaService, never()).flushToDb(any());
    }

    @Test
    @DisplayName("리뷰 생성 실패 - reviewerVersion이 currentVersion보다 크면 REVIEW_VERSION_NOT_VALID 에러 발생")
    void createReview_Fail_ReviewerVersionTooNew() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;
        Long coverLetterId = 1L;

        ReviewCreateRequest request = new ReviewCreateRequest(
                10L, 0L, 5L, "원본", "제안", "코멘트"
        );

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );
        // qnA.version = 0 (기본값) → reviewerVersion(10) > currentVersion(0)

        given(qnARepository.findByIdOrElseThrow(qnaId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);

        // when & then
        assertThatThrownBy(() -> reviewService.createReview(reviewerId, qnaId, request))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ReviewErrorCode.REVIEW_VERSION_AHEAD);

        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("리뷰 생성 실패 - OT 이력이 reviewerVersion을 포함하지 않으면 REVIEW_VERSION_TOO_OLD 에러 발생")
    void createReview_Fail_OtHistoryNotAvailable() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;
        Long coverLetterId = 1L;

        ReviewCreateRequest request = new ReviewCreateRequest(
                3L, 0L, 5L, "원본", "제안", "코멘트"
        );

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );
        ReflectionTestUtils.setField(qnA, "version", 6L);

        // getOtDeltasSince가 빈 목록 반환 → hasOtHistorySinceReviewerVersion = false
        given(qnARepository.findByIdOrElseThrow(qnaId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(textDeltaService.getOtDeltasSince(qnaId, 3L)).willReturn(List.of());

        // when & then
        assertThatThrownBy(() -> reviewService.createReview(reviewerId, qnaId, request))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ReviewErrorCode.REVIEW_VERSION_TOO_OLD);

        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("리뷰 생성 실패 - OT 이력에 공백이 있으면 REVIEW_VERSION_TOO_OLD 에러 발생")
    void createReview_Fail_OtHistoryHasGap() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;
        Long coverLetterId = 1L;

        ReviewCreateRequest request = new ReviewCreateRequest(
                3L, 0L, 5L, "원본", "제안", "코멘트"
        );

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );
        ReflectionTestUtils.setField(qnA, "version", 6L);

        // 가장 오래된 델타의 version이 reviewerVersion(3)보다 큼 → 공백 존재
        List<TextUpdateRequest> otDeltas = List.of(
                new TextUpdateRequest(4L, 0, 0, "X")  // version=4 > reviewerVersion=3
        );

        given(qnARepository.findByIdOrElseThrow(qnaId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(textDeltaService.getOtDeltasSince(qnaId, 3L)).willReturn(otDeltas);

        // when & then
        assertThatThrownBy(() -> reviewService.createReview(reviewerId, qnaId, request))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ReviewErrorCode.REVIEW_VERSION_TOO_OLD);

        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("리뷰 생성 실패 - OT 변환 후 originText가 현재 텍스트와 불일치하면 REVIEW_TEXT_MISMATCH 에러 발생")
    void createReview_Fail_OriginTextMismatch() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;
        Long coverLetterId = 1L;

        ReviewCreateRequest request = new ReviewCreateRequest(
                0L, 0L, 5L, "원본", "제안", "코멘트"
        );

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );
        // answer[0,5) = "HELLO" ≠ originText "원본"
        ReflectionTestUtils.setField(qnA, "answer", "HELLO WORLD");

        given(qnARepository.findByIdOrElseThrow(qnaId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);

        // when & then
        assertThatThrownBy(() -> reviewService.createReview(reviewerId, qnaId, request))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ReviewErrorCode.REVIEW_TEXT_MISMATCH);

        verify(reviewRepository, never()).save(any());
    }

    // ─────────────────────────────────────────────────────────────
    // editReview
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("리뷰 수정 성공")
    void editReview_Success() {
        // given
        String userId = "reviewer123";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 100L;

        ReviewEditRequest request = new ReviewEditRequest("수정된 제안 텍스트", "수정된 코멘트");

        Review existingReview = ReviewFixture.builder()
                .id(reviewId).reviewerId(userId).qnaId(qnAId)
                .suggest("기존 제안 텍스트").comment("기존 코멘트").build();

        Review updatedReview = ReviewFixture.builder()
                .id(reviewId).reviewerId(userId).qnaId(qnAId)
                .suggest(request.suggest()).comment(request.comment()).build();

        given(qnARepository.getCoverLetterIdByQnAIdOrElseThrow(qnAId)).willReturn(coverLetterId);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(userId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(existingReview);
        given(reviewRepository.save(existingReview)).willReturn(updatedReview);

        // when
        reviewService.editReview(userId, qnAId, reviewId, request);

        // then
        assertThat(existingReview.getSuggest()).isEqualTo(request.suggest());
        assertThat(existingReview.getComment()).isEqualTo(request.comment());
        verify(reviewRepository, times(1)).save(existingReview);
        verify(eventPublisher, times(1)).publishEvent(any(ReviewEditEvent.class));
    }

    @Test
    @DisplayName("리뷰 수정 실패 - REVIEWER로 웹소켓에 연결되어 있지 않으면 FORBIDDEN 에러 발생")
    void editReview_Fail_NotConnectedAsReviewer() {
        // given
        String userId = "reviewer123";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 100L;

        ReviewEditRequest request = new ReviewEditRequest("수정된 제안 텍스트", "수정된 코멘트");

        given(qnARepository.getCoverLetterIdByQnAIdOrElseThrow(qnAId)).willReturn(coverLetterId);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(userId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> reviewService.editReview(userId, qnAId, reviewId, request))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("리뷰 수정 실패 - 리뷰 소유자가 아닌 경우 FORBIDDEN 에러 발생")
    void editReview_Fail_NotReviewOwner() {
        // given
        String ownerId = "reviewer123";
        String otherUserId = "otherUser456";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        ReviewEditRequest request = new ReviewEditRequest("수정된 제안 텍스트", "수정된 코멘트");

        Review existingReview = ReviewFixture.builder()
                .id(reviewId).reviewerId(ownerId).qnaId(qnAId)
                .suggest("기존 제안 텍스트").comment("기존 코멘트").build();

        given(qnARepository.getCoverLetterIdByQnAIdOrElseThrow(qnAId)).willReturn(coverLetterId);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(otherUserId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(existingReview);

        // when & then
        assertThatThrownBy(() -> reviewService.editReview(otherUserId, qnAId, reviewId, request))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("리뷰 수정 실패 - 리뷰가 해당 QnA에 속하지 않는 경우 REVIEW_NOT_BELONGS_TO_QNA 에러 발생")
    void editReview_Fail_ReviewNotBelongsToQnA() {
        // given
        String userId = "reviewer123";
        Long reviewQnAId = 1L;
        Long requestQnAId = 2L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        ReviewEditRequest request = new ReviewEditRequest("수정된 제안 텍스트", "수정된 코멘트");

        Review existingReview = ReviewFixture.builder()
                .id(reviewId).reviewerId(userId).qnaId(reviewQnAId)
                .suggest("기존 제안 텍스트").comment("기존 코멘트").build();

        given(qnARepository.getCoverLetterIdByQnAIdOrElseThrow(requestQnAId)).willReturn(coverLetterId);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(userId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(existingReview);

        // when & then
        assertThatThrownBy(() -> reviewService.editReview(userId, requestQnAId, reviewId, request))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ReviewErrorCode.REVIEW_NOT_BELONGS_TO_QNA);

        verify(reviewRepository, never()).save(any());
    }

    // ─────────────────────────────────────────────────────────────
    // deleteReview
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("리뷰 삭제 성공 - ReviewOwner가 삭제")
    void deleteReview_Success_ByReviewOwner() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        Review review = ReviewFixture.builder()
                .id(reviewId).reviewerId(reviewerId).qnaId(qnAId)
                .suggest("수정 제안 텍스트").comment("코멘트").build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).companyName("카카오")
                .applyYear(2024).applyHalf(ApplyHalfType.FIRST_HALF).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "지원동기는 무엇인가요?", QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(review));

        // when
        reviewService.deleteReview(reviewerId, qnAId, reviewId);

        // then
        verify(textDeltaService, times(1)).flushToDb(qnAId);
        verify(reviewRepository, times(1)).delete(review);
        verify(eventPublisher, times(1)).publishEvent(any(ReviewDeleteEvent.class));
    }

    @Test
    @DisplayName("리뷰 삭제 성공 - QnAOwner가 삭제")
    void deleteReview_Success_ByQnAOwner() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        Review review = ReviewFixture.builder()
                .id(reviewId).reviewerId(reviewerId).qnaId(qnAId)
                .suggest("수정 제안 텍스트").comment("코멘트").build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).companyName("토스")
                .applyYear(2024).applyHalf(ApplyHalfType.SECOND_HALF).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "지원동기는 무엇인가요?", QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(writerId, coverLetterId, ReviewRoleType.WRITER)).willReturn(true);
        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(review));

        // when
        reviewService.deleteReview(writerId, qnAId, reviewId);

        // then
        verify(textDeltaService, times(1)).flushToDb(qnAId);
        verify(reviewRepository, times(1)).delete(review);
        verify(eventPublisher, times(1)).publishEvent(any(ReviewDeleteEvent.class));
    }

    @Test
    @DisplayName("리뷰 삭제 성공 - answer에 마커가 있으면 마커를 제거하고 TextReplaceAllEvent를 발행한다")
    void deleteReview_Success_MarkerFound_UnwrapsAndPublishesEvents() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;
        String originText = "원본";

        Review review = ReviewFixture.builder()
                .id(reviewId).reviewerId(reviewerId).qnaId(qnAId)
                .originText(originText).build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );
        // answer에 마커 포함
        ReflectionTestUtils.setField(qnA, "answer", "시작⟦r:1⟧원본⟦/r⟧끝");

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(review));

        // when
        reviewService.deleteReview(reviewerId, qnAId, reviewId);

        // then
        assertThat(qnA.getAnswer()).isEqualTo("시작원본끝");
        verify(eventPublisher, times(1)).publishEvent(any(TextReplaceAllEvent.class));
        verify(eventPublisher, times(1)).publishEvent(any(ReviewDeleteEvent.class));
        verify(textDeltaService, times(1)).resetDeltaVersion(eq(qnAId), anyLong());
    }

    @Test
    @DisplayName("리뷰 삭제 성공 - answer에 마커가 없으면 삭제 이벤트만 발행한다")
    void deleteReview_Success_MarkerNotFound_OnlyDeleteEventPublished() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        Review review = ReviewFixture.builder()
                .id(reviewId).reviewerId(reviewerId).qnaId(qnAId)
                .originText("원본").build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );
        // answer에 마커 없음
        ReflectionTestUtils.setField(qnA, "answer", "마커없는텍스트");

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(review));

        // when
        reviewService.deleteReview(reviewerId, qnAId, reviewId);

        // then
        assertThat(qnA.getAnswer()).isEqualTo("마커없는텍스트");  // answer 변경 없음
        verify(eventPublisher, never()).publishEvent(any(TextReplaceAllEvent.class));
        verify(eventPublisher, times(1)).publishEvent(any(ReviewDeleteEvent.class));
        verify(textDeltaService, never()).resetDeltaVersion(any(), anyLong());
    }

    @Test
    @DisplayName("리뷰 삭제 실패 - 웹소켓에 연결되어 있지 않으면 FORBIDDEN 에러 발생")
    void deleteReview_Fail_NotConnectedViaWebSocket() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "지원동기는 무엇인가요?", QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> reviewService.deleteReview(reviewerId, qnAId, reviewId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(reviewRepository, never()).delete(any());
    }

    @Test
    @DisplayName("리뷰 삭제 실패 - ReviewOwner도 QnAOwner도 아닌 사용자가 삭제 요청")
    void deleteReview_Fail_NotReviewOwnerNorQnAOwner() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        String otherUserId = "otherUser789";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        Review review = ReviewFixture.builder()
                .id(reviewId).reviewerId(reviewerId).qnaId(qnAId)
                .suggest("수정 제안 텍스트").comment("코멘트").build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).companyName("네이버")
                .applyYear(2025).applyHalf(ApplyHalfType.FIRST_HALF).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "지원동기는 무엇인가요?", QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(otherUserId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(review));

        // when & then
        assertThatThrownBy(() -> reviewService.deleteReview(otherUserId, qnAId, reviewId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(reviewRepository, never()).delete(any());
    }

    @Test
    @DisplayName("리뷰 삭제 실패 - 리뷰가 해당 QnA에 속하지 않는 경우")
    void deleteReview_Fail_ReviewNotBelongsToQnA() {
        // given
        String userId = "reviewer123";
        Long reviewQnAId = 1L;
        Long requestQnAId = 2L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        Review review = ReviewFixture.builder()
                .id(reviewId).reviewerId(userId).qnaId(reviewQnAId).build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(userId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                requestQnAId, coverLetter, userId, "질문", QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(requestQnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(userId, coverLetterId, ReviewRoleType.WRITER)).willReturn(true);
        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(review));

        // when & then
        assertThatThrownBy(() -> reviewService.deleteReview(userId, requestQnAId, reviewId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ReviewErrorCode.REVIEW_NOT_BELONGS_TO_QNA);

        verify(reviewRepository, never()).delete(any());
    }

    // ─────────────────────────────────────────────────────────────
    // approveReview
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("첨삭 댓글 적용 성공 - QnA 작성자가 리뷰를 승인하면 originText ↔ suggest가 스왑된다")
    void approveReview_Success() {
        // given
        String writerId = "writer123";
        String reviewerId = "reviewer456";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        String originalText = "기존 텍스트";
        String suggestedText = "수정된 텍스트";

        Review review = ReviewFixture.builder()
                .id(reviewId).reviewerId(reviewerId).qnaId(qnAId)
                .originText(originalText).suggest(suggestedText).isApproved(false).build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "지원동기는 무엇인가요?", QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(writerId, coverLetterId, ReviewRoleType.WRITER)).willReturn(true);
        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(review);
        given(reviewRepository.save(review)).willReturn(review);

        // when
        reviewService.approveReview(writerId, qnAId, reviewId);

        // then
        assertThat(review.isApproved()).isTrue();
        assertThat(review.getOriginText()).isEqualTo(suggestedText);
        assertThat(review.getSuggest()).isEqualTo(originalText);
        verify(eventPublisher, times(1)).publishEvent(any(ReviewEditEvent.class));
    }

    @Test
    @DisplayName("첨삭 댓글 적용 성공 - answer에 마커가 있으면 마커 내용을 suggest로 교체하고 TextReplaceAllEvent를 발행한다")
    void approveReview_Success_MarkerContentReplacedWithSuggest() {
        // given
        String writerId = "writer123";
        String reviewerId = "reviewer456";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        String originalText = "기존 텍스트";
        String suggestedText = "수정된 텍스트";

        Review review = ReviewFixture.builder()
                .id(reviewId).reviewerId(reviewerId).qnaId(qnAId)
                .originText(originalText).suggest(suggestedText).isApproved(false).build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );
        // answer에 마커 포함 (originText가 마커 내 텍스트)
        ReflectionTestUtils.setField(qnA, "answer", "시작⟦r:1⟧기존 텍스트⟦/r⟧끝");

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(writerId, coverLetterId, ReviewRoleType.WRITER)).willReturn(true);
        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(review);
        given(reviewRepository.save(review)).willReturn(review);

        // when
        reviewService.approveReview(writerId, qnAId, reviewId);

        // then — approve() 후 originText = suggest(수정된 텍스트), 마커 내 텍스트도 교체됨
        assertThat(qnA.getAnswer()).isEqualTo("시작⟦r:1⟧수정된 텍스트⟦/r⟧끝");
        verify(eventPublisher, times(1)).publishEvent(any(TextReplaceAllEvent.class));
        verify(eventPublisher, times(1)).publishEvent(any(ReviewEditEvent.class));
        verify(textDeltaService, times(1)).resetDeltaVersion(eq(qnAId), anyLong());
    }

    @Test
    @DisplayName("첨삭 댓글 적용 성공 - 이미 승인된 리뷰를 다시 승인하면 원상복구되고 마커 내용도 원복된다")
    void approveReview_Success_AlreadyApprovedReviewRestoresMarker() {
        // given
        String writerId = "writer123";
        String reviewerId = "reviewer456";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        // 승인된 상태: originText = 수정된 텍스트, suggest = 기존 텍스트
        String currentOriginText = "수정된 텍스트";
        String currentSuggestText = "기존 텍스트";

        Review review = ReviewFixture.builder()
                .id(reviewId).reviewerId(reviewerId).qnaId(qnAId)
                .originText(currentOriginText).suggest(currentSuggestText).isApproved(true).build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );
        // 승인 상태: 마커 내 텍스트 = originText(수정된 텍스트)
        ReflectionTestUtils.setField(qnA, "answer", "시작⟦r:1⟧수정된 텍스트⟦/r⟧끝");

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(writerId, coverLetterId, ReviewRoleType.WRITER)).willReturn(true);
        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(review);
        given(reviewRepository.save(review)).willReturn(review);

        // when
        reviewService.approveReview(writerId, qnAId, reviewId);

        // then — restore() 후 originText = 기존 텍스트, 마커도 원복
        assertThat(review.isApproved()).isFalse();
        assertThat(review.getOriginText()).isEqualTo(currentSuggestText);
        assertThat(review.getSuggest()).isEqualTo(currentOriginText);
        assertThat(qnA.getAnswer()).isEqualTo("시작⟦r:1⟧기존 텍스트⟦/r⟧끝");
        verify(eventPublisher, times(1)).publishEvent(any(TextReplaceAllEvent.class));
        verify(eventPublisher, times(1)).publishEvent(any(ReviewEditEvent.class));
    }

    @Test
    @DisplayName("첨삭 댓글 적용 실패 - WRITER로 웹소켓에 연결되어 있지 않으면 FORBIDDEN 에러 발생")
    void approveReview_Fail_NotConnectedAsWriter() {
        // given
        String writerId = "writer123";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "지원동기는 무엇인가요?", QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(writerId, coverLetterId, ReviewRoleType.WRITER)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> reviewService.approveReview(writerId, qnAId, reviewId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("첨삭 댓글 적용 실패 - QnA 작성자가 아닌 경우 FORBIDDEN 에러 발생")
    void approveReview_Fail_NotQnAOwner() {
        // given
        String writerId = "writer123";
        String reviewerId = "reviewer456";
        String otherUserId = "other789";
        Long qnAId = 1L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        Review review = ReviewFixture.builder()
                .id(reviewId).reviewerId(reviewerId).qnaId(qnAId).build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "지원동기는 무엇인가요?", QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(otherUserId, coverLetterId, ReviewRoleType.WRITER)).willReturn(true);
        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(review);

        // when & then
        assertThatThrownBy(() -> reviewService.approveReview(otherUserId, qnAId, reviewId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        assertThat(review.isApproved()).isFalse();
    }

    @Test
    @DisplayName("첨삭 댓글 적용 실패 - 리뷰가 해당 QnA에 속하지 않는 경우")
    void approveReview_Fail_ReviewNotBelongsToQnA() {
        // given
        String writerId = "writer123";
        Long reviewQnAId = 1L;
        Long requestQnAId = 2L;
        Long reviewId = 1L;
        Long coverLetterId = 1L;

        Review review = ReviewFixture.builder()
                .id(reviewId).reviewerId("reviewer").qnaId(reviewQnAId).build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                requestQnAId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(requestQnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(writerId, coverLetterId, ReviewRoleType.WRITER)).willReturn(true);
        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(review);

        // when & then
        assertThatThrownBy(() -> reviewService.approveReview(writerId, requestQnAId, reviewId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ReviewErrorCode.REVIEW_NOT_BELONGS_TO_QNA);
    }

    // ─────────────────────────────────────────────────────────────
    // getAllReviews
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("전체 첨삭 댓글 조회 - WRITER는 모든 리뷰를 조회할 수 있다")
    void getAllReviews_Writer_CanSeeAllReviews() {
        // given
        String writerId = "writer123";
        String reviewer1Id = "reviewer1";
        String reviewer2Id = "reviewer2";
        Long qnAId = 1L;
        Long coverLetterId = 1L;

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).companyName("테스트기업")
                .applyYear(2024).applyHalf(ApplyHalfType.FIRST_HALF).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "지원동기는 무엇인가요?", QuestionCategoryType.MOTIVATION
        );

        Review review1 = ReviewFixture.builder()
                .id(1L).reviewerId(reviewer1Id).qnaId(qnAId)
                .originText("원본1").suggest("제안1").comment("코멘트1").build();

        Review review2 = ReviewFixture.builder()
                .id(2L).reviewerId(reviewer2Id).qnaId(qnAId)
                .originText("원본2").suggest("제안2").comment("코멘트2").build();

        User reviewer1 = UserFixture.builder().id(reviewer1Id).nickname("리뷰어1").build();
        User reviewer2 = UserFixture.builder().id(reviewer2Id).nickname("리뷰어2").build();

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(writerId, coverLetterId, ReviewRoleType.WRITER)).willReturn(true);
        given(reviewRepository.findAllByQnaId(qnAId)).willReturn(List.of(review1, review2));
        given(userRepository.findAllByIdIn(any())).willReturn(List.of(reviewer1, reviewer2));

        // when
        ReviewsGetResponse response = reviewService.getAllReviews(writerId, qnAId);

        // then
        assertThat(response.reviews()).hasSize(2);
        assertThat(response.reviews()).extracting("id").containsExactlyInAnyOrder(1L, 2L);
        assertThat(response.reviews()).extracting(r -> r.sender().id())
                .containsExactlyInAnyOrder(reviewer1Id, reviewer2Id);
    }

    @Test
    @DisplayName("전체 첨삭 댓글 조회 - REVIEWER는 자신이 작성한 리뷰만 조회할 수 있다")
    void getAllReviews_Reviewer_CanSeeOnlyOwnReviews() {
        // given
        String writerId = "writer123";
        String reviewerId = "reviewer1";
        Long qnAId = 1L;
        Long coverLetterId = 1L;

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).companyName("테스트기업")
                .applyYear(2024).applyHalf(ApplyHalfType.FIRST_HALF).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "지원동기는 무엇인가요?", QuestionCategoryType.MOTIVATION
        );

        Review review1 = ReviewFixture.builder()
                .id(1L).reviewerId(reviewerId).qnaId(qnAId)
                .originText("원본1").suggest("제안1").comment("코멘트1").build();

        Review review2 = ReviewFixture.builder()
                .id(2L).reviewerId(reviewerId).qnaId(qnAId)
                .originText("원본2").suggest("제안2").comment("코멘트2").build();

        User reviewer = UserFixture.builder().id(reviewerId).nickname("리뷰어").build();

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(reviewerId, coverLetterId, ReviewRoleType.REVIEWER)).willReturn(true);
        given(userRepository.findByIdOrElseThrow(reviewerId)).willReturn(reviewer);
        given(reviewRepository.findAllByQnaIdAndReviewerId(qnAId, reviewerId)).willReturn(List.of(review1, review2));

        // when
        ReviewsGetResponse response = reviewService.getAllReviews(reviewerId, qnAId);

        // then
        assertThat(response.reviews()).hasSize(2);
        assertThat(response.reviews()).allMatch(r -> r.sender().id().equals(reviewerId));
    }

    @Test
    @DisplayName("전체 첨삭 댓글 조회 실패 - 웹소켓에 연결되어 있지 않으면 FORBIDDEN 에러 발생")
    void getAllReviews_Fail_NotConnectedViaWebSocket() {
        // given
        String writerId = "writer123";
        Long qnAId = 1L;
        Long coverLetterId = 1L;

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(writerId, coverLetterId, ReviewRoleType.WRITER)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> reviewService.getAllReviews(writerId, qnAId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(reviewRepository, never()).findAllByQnaId(any());
    }

    @Test
    @DisplayName("전체 첨삭 댓글 조회 - 탈퇴한 유저의 리뷰는 제외된다 (WRITER)")
    void getAllReviews_FiltersDeletedUserReviews() {
        // given
        String writerId = "writer123";
        String activeReviewerId = "reviewer1";
        String deletedReviewerId = "deletedReviewer";
        Long qnAId = 1L;
        Long coverLetterId = 1L;

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );

        Review activeReview = ReviewFixture.builder().id(1L).reviewerId(activeReviewerId).qnaId(qnAId).build();
        Review deletedUserReview = ReviewFixture.builder().id(2L).reviewerId(deletedReviewerId).qnaId(qnAId).build();
        User activeReviewer = UserFixture.builder().id(activeReviewerId).nickname("활성리뷰어").build();

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(writerId, coverLetterId, ReviewRoleType.WRITER)).willReturn(true);
        given(reviewRepository.findAllByQnaId(qnAId)).willReturn(List.of(activeReview, deletedUserReview));
        given(userRepository.findAllByIdIn(any())).willReturn(List.of(activeReviewer));  // deletedReviewer 없음

        // when
        ReviewsGetResponse response = reviewService.getAllReviews(writerId, qnAId);

        // then
        assertThat(response.reviews()).hasSize(1);
        assertThat(response.reviews().get(0).id()).isEqualTo(1L);
    }

    @Test
    @DisplayName("전체 첨삭 댓글 조회 - 리뷰가 없는 경우 빈 리스트 반환")
    void getAllReviews_ReturnsEmptyListWhenNoReviews() {
        // given
        String writerId = "writer123";
        Long qnAId = 1L;
        Long coverLetterId = 1L;

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(coverLetterId).userId(writerId).build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId, coverLetter, writerId, "질문", QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(shareLinkSessionRegistry.isConnectedUserInCoverLetter(writerId, coverLetterId, ReviewRoleType.WRITER)).willReturn(true);
        given(reviewRepository.findAllByQnaId(qnAId)).willReturn(List.of());
        given(userRepository.findAllByIdIn(any())).willReturn(List.of());

        // when
        ReviewsGetResponse response = reviewService.getAllReviews(writerId, qnAId);

        // then
        assertThat(response.reviews()).isEmpty();
    }
}