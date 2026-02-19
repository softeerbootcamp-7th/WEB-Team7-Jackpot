package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.LabeledQnAListResponse;
import com.jackpot.narratix.domain.entity.LabeledQnA;
import com.jackpot.narratix.domain.entity.UploadJob;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.domain.repository.LabeledQnARepository;
import com.jackpot.narratix.domain.repository.UploadJobRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UploadServiceTest {

    @Mock
    private UploadJobRepository uploadJobRepository;

    @Mock
    private LabeledQnARepository labeledQnARepository;

    @InjectMocks
    private UploadService uploadService;

    @Test
    @DisplayName("라벨링된 QnA 목록 조회 성공 - QnA가 있는 경우")
    void findLabeledCoverLetterByUploadJobId_성공() {
        // given
        String userId = "user1";
        String uploadJobId = "job1";

        UploadJob uploadJob = mock(UploadJob.class);
        when(uploadJob.isOwner(userId)).thenReturn(true);
        when(uploadJobRepository.findByIdOrElseThrow(uploadJobId)).thenReturn(uploadJob);

        LabeledQnA qna1 = mock(LabeledQnA.class);
        when(qna1.getQuestion()).thenReturn("지원 동기는?");
        when(qna1.getAnswer()).thenReturn("성장 가능성을 보고 지원했습니다.");
        when(qna1.getQuestionCategory()).thenReturn(QuestionCategoryType.MOTIVATION);

        LabeledQnA qna2 = mock(LabeledQnA.class);
        when(qna2.getQuestion()).thenReturn("팀워크 경험은?");
        when(qna2.getAnswer()).thenReturn("팀 프로젝트에서 협업한 경험이 있습니다.");
        when(qna2.getQuestionCategory()).thenReturn(QuestionCategoryType.TEAMWORK_EXPERIENCE);

        when(labeledQnARepository.findAllByUploadJobId(uploadJobId)).thenReturn(List.of(qna1, qna2));

        // when
        LabeledQnAListResponse response = uploadService.findLabeledCoverLetterByUploadJobId(userId, uploadJobId);

        // then
        assertThat(response.qnaList()).hasSize(2);
        verify(uploadJobRepository, times(1)).findByIdOrElseThrow(uploadJobId);
        verify(labeledQnARepository, times(1)).findAllByUploadJobId(uploadJobId);
    }

    @Test
    @DisplayName("라벨링된 QnA 목록 조회 성공 - QnA가 없는 경우 빈 리스트 반환")
    void findLabeledCoverLetterByUploadJobId_빈_목록() {
        // given
        String userId = "user1";
        String uploadJobId = "job1";

        UploadJob uploadJob = mock(UploadJob.class);
        when(uploadJob.isOwner(userId)).thenReturn(true);
        when(uploadJobRepository.findByIdOrElseThrow(uploadJobId)).thenReturn(uploadJob);
        when(labeledQnARepository.findAllByUploadJobId(uploadJobId)).thenReturn(List.of());

        // when
        LabeledQnAListResponse response = uploadService.findLabeledCoverLetterByUploadJobId(userId, uploadJobId);

        // then
        assertThat(response.qnaList()).isEmpty();
        verify(uploadJobRepository, times(1)).findByIdOrElseThrow(uploadJobId);
        verify(labeledQnARepository, times(1)).findAllByUploadJobId(uploadJobId);
    }

    @Test
    @DisplayName("존재하지 않는 uploadJobId 조회 시 UPLOAD_JOB_NOT_FOUND 예외 발생")
    void findLabeledCoverLetterByUploadJobId_Job없음() {
        // given
        String userId = "user1";
        String uploadJobId = "notExistJobId";

        when(uploadJobRepository.findByIdOrElseThrow(uploadJobId))
                .thenThrow(new BaseException(UploadErrorCode.UPLOAD_JOB_NOT_FOUND));

        // when & then
        assertThatThrownBy(() -> uploadService.findLabeledCoverLetterByUploadJobId(userId, uploadJobId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", UploadErrorCode.UPLOAD_JOB_NOT_FOUND);

        verify(uploadJobRepository, times(1)).findByIdOrElseThrow(uploadJobId);
        verify(labeledQnARepository, never()).findAllByUploadJobId(any());
    }

    @Test
    @DisplayName("다른 사용자의 uploadJob 조회 시 FORBIDDEN 예외 발생")
    void findLabeledCoverLetterByUploadJobId_권한없음() {
        // given
        String requestUserId = "user2";
        String uploadJobId = "job1";

        UploadJob uploadJob = mock(UploadJob.class);
        when(uploadJob.isOwner(requestUserId)).thenReturn(false);
        when(uploadJobRepository.findByIdOrElseThrow(uploadJobId)).thenReturn(uploadJob);

        // when & then
        assertThatThrownBy(() -> uploadService.findLabeledCoverLetterByUploadJobId(requestUserId, uploadJobId))
                .isInstanceOf(BaseException.class)
                .hasFieldOrPropertyWithValue("errorCode", GlobalErrorCode.FORBIDDEN);

        verify(uploadJobRepository, times(1)).findByIdOrElseThrow(uploadJobId);
        verify(labeledQnARepository, never()).findAllByUploadJobId(any());
    }
}