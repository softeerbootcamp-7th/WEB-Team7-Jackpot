package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.response.ReviewEditResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.entity.notification_meta.FeedbackNotificationMeta;
import com.jackpot.narratix.domain.fixture.CoverLetterFixture;
import com.jackpot.narratix.domain.fixture.QnAFixture;
import com.jackpot.narratix.domain.fixture.ReviewFixture;
import com.jackpot.narratix.domain.fixture.UserFixture;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ReviewRepository;
import com.jackpot.narratix.domain.repository.UserRepository;
import com.jackpot.narratix.domain.service.dto.NotificationSendRequest;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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

    @Test
    @DisplayName("리뷰 생성 성공")
    void createReview_Success() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;

        ReviewCreateRequest request = new ReviewCreateRequest(
                1L,
                0L,
                100L,
                "원본 텍스트",
                "수정 제안 텍스트",
                "피드백 코멘트"
        );

        Review savedReview = ReviewFixture.builder()
                .id(1L)
                .reviewerId(reviewerId)
                .qnaId(qnaId)
                .suggest(request.suggest())
                .comment(request.comment())
                .build();

        User reviewer = UserFixture.builder()
                .id(reviewerId)
                .nickname("리뷰어")
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .companyName("테스트기업")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        given(reviewRepository.save(any(Review.class))).willReturn(savedReview);
        given(userRepository.findByIdOrElseThrow(reviewerId)).willReturn(reviewer);
        given(qnARepository.findByIdOrElseThrow(qnaId)).willReturn(qnA);
        doNothing().when(notificationService).sendNotification(any(), any());

        // when
        reviewService.createReview(reviewerId, qnaId, request);

        // then
        verify(reviewRepository, times(1)).save(any(Review.class));
        verify(userRepository, times(1)).findByIdOrElseThrow(reviewerId);
        verify(qnARepository, times(1)).findByIdOrElseThrow(qnaId);
        verify(notificationService, times(1)).sendNotification(eq(writerId), any(NotificationSendRequest.class));
    }

    @Test
    @DisplayName("리뷰 생성 시 피드백 알림이 올바르게 생성된다")
    void createReview_CreatesCorrectNotification() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;

        ReviewCreateRequest request = new ReviewCreateRequest(
                1L,
                0L,
                100L,
                "원본 텍스트",
                "수정 제안 텍스트",
                "피드백 코멘트"
        );

        Review savedReview = ReviewFixture.builder()
                .id(1L)
                .reviewerId(reviewerId)
                .qnaId(qnaId)
                .suggest(request.suggest())
                .comment(request.comment())
                .build();

        User reviewer = UserFixture.builder()
                .id(reviewerId)
                .nickname("리뷰어닉네임")
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .companyName("카카오")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.SECOND_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        given(reviewRepository.save(any(Review.class))).willReturn(savedReview);
        given(userRepository.findByIdOrElseThrow(reviewerId)).willReturn(reviewer);
        given(qnARepository.findByIdOrElseThrow(qnaId)).willReturn(qnA);

        ArgumentCaptor<NotificationSendRequest> notificationCaptor = ArgumentCaptor.forClass(NotificationSendRequest.class);

        // when
        reviewService.createReview(reviewerId, qnaId, request);

        // then
        verify(notificationService, times(1)).sendNotification(eq(writerId), notificationCaptor.capture());

        NotificationSendRequest capturedNotification = notificationCaptor.getValue();
        assertThat(capturedNotification.type()).isEqualTo(NotificationType.FEEDBACK);
        assertThat(capturedNotification.title()).isEqualTo("카카오 2024 하반기");
        assertThat(capturedNotification.content()).isNull(); // answer가 설정되지 않았으므로 null
        assertThat(capturedNotification.meta()).isInstanceOf(FeedbackNotificationMeta.class);

        FeedbackNotificationMeta meta = (FeedbackNotificationMeta) capturedNotification.meta();
        assertThat(meta.getSender().getId()).isEqualTo(reviewerId);
        assertThat(meta.getSender().getNickname()).isEqualTo("리뷰어닉네임");
        assertThat(meta.getQnAId()).isEqualTo(qnaId);
    }

    @Test
    @DisplayName("리뷰 생성 시 reviewer는 sender이고 writer는 알림을 받는다")
    void createReview_ReviewerIsSenderAndWriterReceivesNotification() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;

        ReviewCreateRequest request = new ReviewCreateRequest(
                1L,
                0L,
                100L,
                "원본 텍스트",
                "수정 제안",
                "코멘트"
        );

        Review savedReview = ReviewFixture.builder()
                .id(1L)
                .reviewerId(reviewerId)
                .qnaId(qnaId)
                .build();

        User reviewer = UserFixture.builder()
                .id(reviewerId)
                .nickname("리뷰어닉네임")
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .companyName("토스")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        given(reviewRepository.save(any(Review.class))).willReturn(savedReview);
        given(userRepository.findByIdOrElseThrow(reviewerId)).willReturn(reviewer);
        given(qnARepository.findByIdOrElseThrow(qnaId)).willReturn(qnA);

        ArgumentCaptor<String> userIdCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<NotificationSendRequest> notificationCaptor = ArgumentCaptor.forClass(NotificationSendRequest.class);

        // when
        reviewService.createReview(reviewerId, qnaId, request);

        // then
        // 1. writer에게 알림이 전송된다
        verify(notificationService, times(1)).sendNotification(userIdCaptor.capture(), notificationCaptor.capture());
        assertThat(userIdCaptor.getValue()).isEqualTo(writerId);

        // 2. reviewer는 알림의 sender이다
        NotificationSendRequest capturedNotification = notificationCaptor.getValue();
        assertThat(capturedNotification.meta()).isInstanceOf(FeedbackNotificationMeta.class);
        FeedbackNotificationMeta meta = (FeedbackNotificationMeta) capturedNotification.meta();
        assertThat(meta.getSender().getId()).isEqualTo(reviewerId);
        assertThat(meta.getSender().getNickname()).isEqualTo("리뷰어닉네임");

        // 3. reviewer에게는 알림이 전송되지 않는다
        verify(notificationService, never()).sendNotification(eq(reviewerId), any());
    }

    @Test
    @DisplayName("리뷰 생성 시 QnA의 answer가 있으면 알림 content에 포함된다")
    void createReview_IncludesAnswerInNotificationContent() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnaId = 1L;
        String answerText = "저는 귀사의 비전에 공감하여 지원하게 되었습니다.";

        ReviewCreateRequest request = new ReviewCreateRequest(
                1L,
                0L,
                100L,
                "원본 텍스트",
                "수정 제안",
                null
        );

        Review savedReview = ReviewFixture.builder()
                .id(1L)
                .reviewerId(reviewerId)
                .qnaId(qnaId)
                .build();

        User reviewer = UserFixture.builder()
                .id(reviewerId)
                .nickname("리뷰어")
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .companyName("네이버")
                .applyYear(2025)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnaId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );
        qnA.editAnswer(answerText);

        given(reviewRepository.save(any(Review.class))).willReturn(savedReview);
        given(userRepository.findByIdOrElseThrow(reviewerId)).willReturn(reviewer);
        given(qnARepository.findByIdOrElseThrow(qnaId)).willReturn(qnA);

        ArgumentCaptor<NotificationSendRequest> notificationCaptor = ArgumentCaptor.forClass(NotificationSendRequest.class);

        // when
        reviewService.createReview(reviewerId, qnaId, request);

        // then
        verify(notificationService, times(1)).sendNotification(eq(writerId), notificationCaptor.capture());

        NotificationSendRequest capturedNotification = notificationCaptor.getValue();
        assertThat(capturedNotification.content()).isEqualTo(answerText);
    }

    @Test
    @DisplayName("리뷰 수정 성공")
    void editReview_Success() {
        // given
        String userId = "reviewer123";
        Long qnAId = 1L;
        Long reviewId = 1L;

        ReviewEditRequest request = new ReviewEditRequest(
                "수정된 제안 텍스트",
                "수정된 코멘트"
        );

        Review existingReview = ReviewFixture.builder()
                .id(reviewId)
                .reviewerId(userId)
                .qnaId(qnAId)
                .suggest("기존 제안 텍스트")
                .comment("기존 코멘트")
                .build();

        Review updatedReview = ReviewFixture.builder()
                .id(reviewId)
                .reviewerId(userId)
                .qnaId(qnAId)
                .suggest(request.suggest())
                .comment(request.comment())
                .build();

        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(existingReview);
        given(reviewRepository.save(existingReview)).willReturn(updatedReview);

        // when
        ReviewEditResponse response = reviewService.editReview(userId, qnAId, reviewId, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.modifiedAt()).isNotNull();
        assertThat(existingReview.getSuggest()).isEqualTo(request.suggest());
        assertThat(existingReview.getComment()).isEqualTo(request.comment());
        verify(reviewRepository, times(1)).findByIdOrElseThrow(reviewId);
        verify(reviewRepository, times(1)).save(existingReview);
    }

    @Test
    @DisplayName("리뷰 수정 실패 - 리뷰 소유자가 아닌 경우 FORBIDDEN 에러 발생")
    void editReview_Fail_NotReviewOwner() {
        // given
        String ownerId = "reviewer123";
        String otherUserId = "otherUser456";
        Long qnAId = 1L;
        Long reviewId = 1L;

        ReviewEditRequest request = new ReviewEditRequest(
                "수정된 제안 텍스트",
                "수정된 코멘트"
        );

        Review existingReview = ReviewFixture.builder()
                .id(reviewId)
                .reviewerId(ownerId)
                .qnaId(qnAId)
                .suggest("기존 제안 텍스트")
                .comment("기존 코멘트")
                .build();

        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(existingReview);

        // when & then
        assertThatThrownBy(() -> reviewService.editReview(otherUserId, qnAId, reviewId, request))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(reviewRepository, times(1)).findByIdOrElseThrow(reviewId);
        verify(reviewRepository, never()).save(any());
    }
}