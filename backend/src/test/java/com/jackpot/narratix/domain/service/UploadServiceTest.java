package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.LabeledQnAListResponse;
import com.jackpot.narratix.domain.entity.LabeledQnA;
import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.entity.UploadJob;
import com.jackpot.narratix.domain.entity.enums.QuestionCategoryType;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.domain.repository.UploadFileRepository;
import com.jackpot.narratix.domain.repository.UploadJobRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UploadServiceTest {

    @Mock
    private UploadJobRepository uploadJobRepository;

    @Mock
    private UploadFileRepository uploadFileRepository;

    @InjectMocks
    private UploadService uploadService;

    @Test
    @DisplayName("라벨링된 QnA 목록 조회 성공 - 계층형 구조 반환 확인")
    void findLabeledCoverLetterByUploadJobId() {
        // given
        String userId = "user1";
        String uploadJobId = "job1";
        UploadFile uploadFile = UploadFile.builder()
                .id("fileId")
                .build();

        UploadJob uploadJob = mock(UploadJob.class);
        when(uploadJob.isOwner(userId)).thenReturn(true);
        when(uploadJobRepository.findByIdOrElseThrow(uploadJobId)).thenReturn(uploadJob);

        LabeledQnA qna1 = LabeledQnA.builder()
                .question("지원 동기는?")
                .answer("성장 가능성을 보고 지원했습니다.")
                .questionCategory(QuestionCategoryType.MOTIVATION)
                .uploadFile(uploadFile)
                .build();

        LabeledQnA qna2 = LabeledQnA.builder()
                .question("팀워크 경험은?")
                .answer("협업한 경험이 있습니다.")
                .questionCategory(QuestionCategoryType.TEAMWORK_EXPERIENCE)
                .uploadFile(uploadFile)
                .build();

        ReflectionTestUtils.setField(uploadFile, "labeledQnAs", List.of(qna1, qna2));
        when(uploadFileRepository.findAllWithQnAsByUploadJobId(uploadJobId)).thenReturn(List.of(uploadFile));

        // when
        LabeledQnAListResponse response = uploadService.findLabeledCoverLetterByUploadJobId(userId, uploadJobId);

        // then
        assertThat(response.coverLetters()).hasSize(1);
        assertThat(response.coverLetters().get(0).qnAs()).hasSize(2);

        assertThat(response.coverLetters().get(0).qnAs())
                .anySatisfy(qna -> {
                    assertThat(qna.question()).isEqualTo("지원 동기는?");
                    assertThat(qna.answerSize()).isEqualTo("성장 가능성을 보고 지원했습니다.".length());
                });

        verify(uploadJobRepository, times(1)).findByIdOrElseThrow(uploadJobId);
        verify(uploadFileRepository, times(1)).findAllWithQnAsByUploadJobId(uploadJobId);
    }

    @Test
    @DisplayName("라벨링된 QnA 목록 조회 성공 - 서로 다른 파일의 QnA는 별도 그룹으로 분리됨")
    void findLabeledCoverLetterByUploadJobId_다중파일_그룹화() {
        // given
        String userId = "user1";
        String uploadJobId = "job1";

        UploadFile uploadFile1 = UploadFile.builder().id("fileId1").build();
        UploadFile uploadFile2 = UploadFile.builder().id("fileId2").build();

        UploadJob uploadJob = mock(UploadJob.class);
        when(uploadJob.isOwner(userId)).thenReturn(true);
        when(uploadJobRepository.findByIdOrElseThrow(uploadJobId)).thenReturn(uploadJob);

        LabeledQnA qna1 = LabeledQnA.builder()
                .question("지원 동기는?")
                .answer("성장 가능성을 보고 지원했습니다.")
                .questionCategory(QuestionCategoryType.MOTIVATION)
                .uploadFile(uploadFile1)
                .build();

        LabeledQnA qna2 = LabeledQnA.builder()
                .question("팀워크 경험은?")
                .answer("협업한 경험이 있습니다.")
                .questionCategory(QuestionCategoryType.TEAMWORK_EXPERIENCE)
                .uploadFile(uploadFile2)
                .build();

        ReflectionTestUtils.setField(uploadFile1, "labeledQnAs", List.of(qna1));
        ReflectionTestUtils.setField(uploadFile2, "labeledQnAs", List.of(qna2));
        when(uploadFileRepository.findAllWithQnAsByUploadJobId(uploadJobId)).thenReturn(List.of(uploadFile1, uploadFile2));

        // when
        LabeledQnAListResponse response = uploadService.findLabeledCoverLetterByUploadJobId(userId, uploadJobId);

        // then
        assertThat(response.coverLetters()).hasSize(2);
        assertThat(response.coverLetters())
                .allSatisfy(coverLetter -> assertThat(coverLetter.qnAs()).hasSize(1));
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
        when(uploadFileRepository.findAllWithQnAsByUploadJobId(uploadJobId)).thenReturn(List.of());

        // when
        LabeledQnAListResponse response = uploadService.findLabeledCoverLetterByUploadJobId(userId, uploadJobId);

        // then
        assertThat(response.coverLetters()).isEmpty();
        verify(uploadJobRepository, times(1)).findByIdOrElseThrow(uploadJobId);
        verify(uploadFileRepository, times(1)).findAllWithQnAsByUploadJobId(uploadJobId);
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
        verify(uploadFileRepository, never()).findAllWithQnAsByUploadJobId(any());
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
        verify(uploadFileRepository, never()).findAllWithQnAsByUploadJobId(any());
    }
}