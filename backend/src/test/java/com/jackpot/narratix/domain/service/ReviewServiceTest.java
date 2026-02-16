package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.ReviewCreateRequest;
import com.jackpot.narratix.domain.controller.request.ReviewEditRequest;
import com.jackpot.narratix.domain.controller.response.ReviewsGetResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Review;
import com.jackpot.narratix.domain.entity.User;
import com.jackpot.narratix.domain.entity.enums.ApplyHalfType;
import com.jackpot.narratix.domain.entity.enums.NotificationType;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.entity.notification_meta.FeedbackNotificationMeta;
import com.jackpot.narratix.domain.exception.ReviewErrorCode;
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

import java.util.List;

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
        reviewService.editReview(userId, qnAId, reviewId, request);

        // then
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

    @Test
    @DisplayName("리뷰 수정 실패 - 리뷰가 해당 QnA에 속하지 않는 경우 REVIEW_NOT_BELONGS_TO_QNA 에러 발생")
    void editReview_Fail_ReviewNotBelongsToQnA() {
        // given
        String userId = "reviewer123";
        Long reviewQnAId = 1L;
        Long requestQnAId = 2L;  // 다른 QnA ID
        Long reviewId = 1L;

        ReviewEditRequest request = new ReviewEditRequest(
                "수정된 제안 텍스트",
                "수정된 코멘트"
        );

        Review existingReview = ReviewFixture.builder()
                .id(reviewId)
                .reviewerId(userId)
                .qnaId(reviewQnAId)  // 리뷰는 QnA 1L에 속함
                .suggest("기존 제안 텍스트")
                .comment("기존 코멘트")
                .build();

        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(existingReview);

        // when & then
        assertThatThrownBy(() -> reviewService.editReview(userId, requestQnAId, reviewId, request))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ReviewErrorCode.REVIEW_NOT_BELONGS_TO_QNA);

        verify(reviewRepository, times(1)).findByIdOrElseThrow(reviewId);
        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("리뷰 삭제 성공 - ReviewOwner가 삭제")
    void deleteReview_Success_ByReviewOwner() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnAId = 1L;
        Long reviewId = 1L;

        Review review = ReviewFixture.builder()
                .id(reviewId)
                .reviewerId(reviewerId)
                .qnaId(qnAId)
                .suggest("수정 제안 텍스트")
                .comment("코멘트")
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .companyName("카카오")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        given(reviewRepository.findById(reviewId)).willReturn(java.util.Optional.of(review));
        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);

        // when
        reviewService.deleteReview(reviewerId, qnAId, reviewId);

        // then
        verify(reviewRepository, times(1)).findById(reviewId);
        verify(qnARepository, times(1)).findByIdOrElseThrow(qnAId);
        verify(reviewRepository, times(1)).delete(review);
    }

    @Test
    @DisplayName("리뷰 삭제 성공 - QnAOwner가 삭제")
    void deleteReview_Success_ByQnAOwner() {
        // given
        String reviewerId = "reviewer123";
        String writerId = "writer456";
        Long qnAId = 1L;
        Long reviewId = 1L;

        Review review = ReviewFixture.builder()
                .id(reviewId)
                .reviewerId(reviewerId)
                .qnaId(qnAId)
                .suggest("수정 제안 텍스트")
                .comment("코멘트")
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .companyName("토스")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.SECOND_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        given(reviewRepository.findById(reviewId)).willReturn(java.util.Optional.of(review));
        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);

        // when
        reviewService.deleteReview(writerId, qnAId, reviewId);

        // then
        verify(reviewRepository, times(1)).findById(reviewId);
        verify(qnARepository, times(1)).findByIdOrElseThrow(qnAId);
        verify(reviewRepository, times(1)).delete(review);
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

        Review review = ReviewFixture.builder()
                .id(reviewId)
                .reviewerId(reviewerId)
                .qnaId(qnAId)
                .suggest("수정 제안 텍스트")
                .comment("코멘트")
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .companyName("네이버")
                .applyYear(2025)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        given(reviewRepository.findById(reviewId)).willReturn(java.util.Optional.of(review));
        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);

        // when & then
        assertThatThrownBy(() -> reviewService.deleteReview(otherUserId, qnAId, reviewId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(reviewRepository, times(1)).findById(reviewId);
        verify(qnARepository, times(1)).findByIdOrElseThrow(qnAId);
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

        Review review = ReviewFixture.builder()
                .id(reviewId)
                .reviewerId(userId)
                .qnaId(reviewQnAId)
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(userId)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                requestQnAId,
                coverLetter,
                userId,
                "질문",
                QuestionCategoryType.MOTIVATION
        );

        given(reviewRepository.findById(reviewId)).willReturn(java.util.Optional.of(review));
        given(qnARepository.findByIdOrElseThrow(requestQnAId)).willReturn(qnA);

        // when & then
        assertThatThrownBy(() -> reviewService.deleteReview(userId, requestQnAId, reviewId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ReviewErrorCode.REVIEW_NOT_BELONGS_TO_QNA);

        verify(reviewRepository, never()).delete(any());
    }

    @Test
    @DisplayName("첨삭 댓글 적용 성공 - QnA 작성자가 리뷰를 승인")
    void approveReview_Success() {
        // given
        String writerId = "writer123";
        String reviewerId = "reviewer456";
        Long qnAId = 1L;
        Long reviewId = 1L;

        String originalText = "기존 텍스트";
        String suggestedText = "수정된 텍스트";

        Review review = ReviewFixture.builder()
                .id(reviewId)
                .reviewerId(reviewerId)
                .qnaId(qnAId)
                .originText(originalText)
                .suggest(suggestedText)
                .isApproved(false)
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(review);
        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);

        // when
        reviewService.approveReview(writerId, qnAId, reviewId);

        // then
        assertThat(review.isApproved()).isTrue();
        assertThat(review.getOriginText()).isEqualTo(suggestedText);
        assertThat(review.getSuggest()).isEqualTo(originalText);
        verify(reviewRepository, times(1)).findByIdOrElseThrow(reviewId);
        verify(qnARepository, times(1)).findByIdOrElseThrow(qnAId);
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

        Review review = ReviewFixture.builder()
                .id(reviewId)
                .reviewerId(reviewerId)
                .qnaId(qnAId)
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(review);
        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);

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

        Review review = ReviewFixture.builder()
                .id(reviewId)
                .reviewerId("reviewer")
                .qnaId(reviewQnAId)
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                requestQnAId,
                coverLetter,
                writerId,
                "질문",
                QuestionCategoryType.MOTIVATION
        );

        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(review);
        given(qnARepository.findByIdOrElseThrow(requestQnAId)).willReturn(qnA);

        // when & then
        assertThatThrownBy(() -> reviewService.approveReview(writerId, requestQnAId, reviewId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", ReviewErrorCode.REVIEW_NOT_BELONGS_TO_QNA);
    }

    @Test
    @DisplayName("첨삭 댓글 적용 성공 - 이미 승인된 리뷰를 다시 승인하면 원상복구된다")
    void approveReview_Success_AlreadyApprovedReviewCanBeRestored() {
        // given
        String writerId = "writer123";
        String reviewerId = "reviewer456";
        Long qnAId = 1L;
        Long reviewId = 1L;

        String currentOriginText = "수정된 텍스트"; // 이미 승인되어 suggest와 swap된 상태
        String currentSuggestText = "기존 텍스트"; // 이미 승인되어 originText와 swap된 상태

        Review review = ReviewFixture.builder()
                .id(reviewId)
                .reviewerId(reviewerId)
                .qnaId(qnAId)
                .originText(currentOriginText)
                .suggest(currentSuggestText)
                .isApproved(true)  // 이미 승인된 상태
                .build();

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        given(reviewRepository.findByIdOrElseThrow(reviewId)).willReturn(review);
        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);

        // when
        reviewService.approveReview(writerId, qnAId, reviewId);

        // then
        assertThat(review.isApproved()).isFalse(); // 원복되어 승인 상태가 해제됨
        assertThat(review.getOriginText()).isEqualTo(currentSuggestText); // swap되어 원복됨
        assertThat(review.getSuggest()).isEqualTo(currentOriginText); // swap되어 원복됨
        verify(reviewRepository, times(1)).findByIdOrElseThrow(reviewId);
        verify(qnARepository, times(1)).findByIdOrElseThrow(qnAId);
    }

    @Test
    @DisplayName("전체 첨삭 댓글 조회 - WRITER는 모든 리뷰를 조회할 수 있다")
    void getAllReviews_Writer_CanSeeAllReviews() {
        // given
        String writerId = "writer123";
        String reviewer1Id = "reviewer1";
        String reviewer2Id = "reviewer2";
        Long qnAId = 1L;

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .companyName("테스트기업")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        Review review1 = ReviewFixture.builder()
                .id(1L)
                .reviewerId(reviewer1Id)
                .qnaId(qnAId)
                .originText("원본1")
                .suggest("제안1")
                .comment("코멘트1")
                .build();

        Review review2 = ReviewFixture.builder()
                .id(2L)
                .reviewerId(reviewer2Id)
                .qnaId(qnAId)
                .originText("원본2")
                .suggest("제안2")
                .comment("코멘트2")
                .build();

        User reviewer1 = UserFixture.builder()
                .id(reviewer1Id)
                .nickname("리뷰어1")
                .build();

        User reviewer2 = UserFixture.builder()
                .id(reviewer2Id)
                .nickname("리뷰어2")
                .build();

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(reviewRepository.findAllByQnaId(qnAId)).willReturn(List.of(review1, review2));
        given(userRepository.findAllByIdIn(any())).willReturn(List.of(reviewer1, reviewer2));

        // when
        ReviewsGetResponse response = reviewService.getAllReviews(writerId, qnAId);

        // then
        assertThat(response.reviews()).hasSize(2);
        assertThat(response.reviews()).extracting("id").containsExactlyInAnyOrder(1L, 2L);
        assertThat(response.reviews()).extracting(r -> r.sender().id())
                .containsExactlyInAnyOrder(reviewer1Id, reviewer2Id);
        verify(qnARepository, times(1)).findByIdOrElseThrow(qnAId);
        verify(reviewRepository, times(1)).findAllByQnaId(qnAId);
        verify(userRepository, times(1)).findAllByIdIn(any());
    }

    @Test
    @DisplayName("전체 첨삭 댓글 조회 - REVIEWER는 자신이 작성한 리뷰만 조회할 수 있다")
    void getAllReviews_Reviewer_CanSeeOnlyOwnReviews() {
        // given
        String writerId = "writer123";
        String reviewerId = "reviewer1";
        Long qnAId = 1L;

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .companyName("테스트기업")
                .applyYear(2024)
                .applyHalf(ApplyHalfType.FIRST_HALF)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId,
                coverLetter,
                writerId,
                "지원동기는 무엇인가요?",
                QuestionCategoryType.MOTIVATION
        );

        Review review1 = ReviewFixture.builder()
                .id(1L)
                .reviewerId(reviewerId)
                .qnaId(qnAId)
                .originText("원본1")
                .suggest("제안1")
                .comment("코멘트1")
                .build();

        Review review2 = ReviewFixture.builder()
                .id(2L)
                .reviewerId(reviewerId)
                .qnaId(qnAId)
                .originText("원본2")
                .suggest("제안2")
                .comment("코멘트2")
                .build();

        User reviewer = UserFixture.builder()
                .id(reviewerId)
                .nickname("리뷰어")
                .build();

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(userRepository.findByIdOrElseThrow(reviewerId)).willReturn(reviewer);
        given(reviewRepository.findAllByQnaIdAndReviewerId(qnAId, reviewerId))
                .willReturn(List.of(review1, review2));

        // when
        ReviewsGetResponse response = reviewService.getAllReviews(reviewerId, qnAId);

        // then
        assertThat(response.reviews()).hasSize(2);
        assertThat(response.reviews()).extracting("id").containsExactlyInAnyOrder(1L, 2L);
        assertThat(response.reviews()).allMatch(r -> r.sender().id().equals(reviewerId));
        verify(qnARepository, times(1)).findByIdOrElseThrow(qnAId);
        verify(userRepository, times(1)).findByIdOrElseThrow(reviewerId);
        verify(reviewRepository, times(1)).findAllByQnaIdAndReviewerId(qnAId, reviewerId);
    }

    @Test
    @DisplayName("전체 첨삭 댓글 조회 - 탈퇴한 유저의 리뷰는 제외된다 (WRITER)")
    void getAllReviews_FiltersDeletedUserReviews() {
        // given
        String writerId = "writer123";
        String activeReviewerId = "reviewer1";
        String deletedReviewerId = "deletedReviewer";
        Long qnAId = 1L;

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId,
                coverLetter,
                writerId,
                "질문",
                QuestionCategoryType.MOTIVATION
        );

        Review activeReview = ReviewFixture.builder()
                .id(1L)
                .reviewerId(activeReviewerId)
                .qnaId(qnAId)
                .build();

        Review deletedUserReview = ReviewFixture.builder()
                .id(2L)
                .reviewerId(deletedReviewerId)
                .qnaId(qnAId)
                .build();

        User activeReviewer = UserFixture.builder()
                .id(activeReviewerId)
                .nickname("활성리뷰어")
                .build();

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(reviewRepository.findAllByQnaId(qnAId)).willReturn(List.of(activeReview, deletedUserReview));
        given(userRepository.findAllByIdIn(any()))
                .willReturn(List.of(activeReviewer)); // deletedReviewer는 조회되지 않음

        // when
        ReviewsGetResponse response = reviewService.getAllReviews(writerId, qnAId);

        // then
        assertThat(response.reviews()).hasSize(1);
        assertThat(response.reviews().get(0).id()).isEqualTo(1L);
        assertThat(response.reviews().get(0).sender().id()).isEqualTo(activeReviewerId);
    }

    @Test
    @DisplayName("전체 첨삭 댓글 조회 - 리뷰가 없는 경우 빈 리스트 반환")
    void getAllReviews_ReturnsEmptyListWhenNoReviews() {
        // given
        String writerId = "writer123";
        Long qnAId = 1L;

        CoverLetter coverLetter = CoverLetterFixture.builder()
                .id(1L)
                .userId(writerId)
                .build();

        QnA qnA = QnAFixture.createQnAWithId(
                qnAId,
                coverLetter,
                writerId,
                "질문",
                QuestionCategoryType.MOTIVATION
        );

        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(qnA);
        given(reviewRepository.findAllByQnaId(qnAId)).willReturn(List.of());
        given(userRepository.findAllByIdIn(any())).willReturn(List.of());

        // when
        ReviewsGetResponse response = reviewService.getAllReviews(writerId, qnAId);

        // then
        assertThat(response.reviews()).isEmpty();
    }
}