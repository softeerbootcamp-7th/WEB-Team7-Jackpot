package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.entity.UploadJob;
import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.domain.repository.UploadFileRepository;
import com.jackpot.narratix.global.exception.BaseException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileProcessServiceTest {

    @Mock
    private UploadFileRepository uploadFileRepository;

    @Mock
    private NotificationService notificationService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private FileProcessService fileProcessService;

    @BeforeEach
    void setUp() {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.initSynchronization();
        }
    }

    @AfterEach
    void tearDown() {
        TransactionSynchronizationManager.clear();
    }

    private UploadFile setupFileAndJobMock(String fileId, String jobId, String userId) {
        UploadFile file = mock(UploadFile.class);
        UploadJob job = mock(UploadJob.class);

        when(uploadFileRepository.findByIdOrElseThrow(fileId)).thenReturn(file);

        when(file.getUploadJob()).thenReturn(job);
        when(job.getId()).thenReturn(jobId);
        when(job.getUserId()).thenReturn(userId);

        lenient().when(job.getUserId()).thenReturn(userId);
        return file;
    }

    private void triggerAfterCommit() {
        for (TransactionSynchronization synchronization : TransactionSynchronizationManager.getSynchronizations()) {
            synchronization.afterCommit();
        }
    }

    @Test
    @DisplayName("파일 추출 및 라벨링 성공 -> (모든 파일 완료) -> 알림 전송 성공")
    void processUploadedFile_success_and_notify() {
        // given
        String fileId = "test-file";
        String jobId = "test-job";
        String userId = "test-user";
        String extractedText = "테스트 텍스트";
        String labelingJson = "[{\"question\":\"Q\",\"answer\":\"A\",\"questionCategory\":\"MOTIVATION\"}]";

        UploadFile file = setupFileAndJobMock(fileId, jobId, userId);

        when(uploadFileRepository.countByUploadJobId(jobId)).thenReturn(2L);
        when(uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.FAILED)).thenReturn(0L);
        when(uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.COMPLETED)).thenReturn(2L);

        // when
        fileProcessService.processUploadedFile(fileId, extractedText, labelingJson);

        // then
        verify(file, times(1)).successExtract(extractedText);
        verify(file, times(1)).successLabeling();
        verify(uploadFileRepository, times(1)).flush();

        triggerAfterCommit();
        verify(notificationService, times(1))
                .sendLabelingCompleteNotification(userId, jobId, 2L, 0L);
    }

    @Test
    @DisplayName("파일 처리는 성공했지만 아직 남은 파일이 있음 -> 알림 전송 안 함")
    void processUploadedFile_success_but_not_completed() {
        // given
        String fileId = "test-file";
        String jobId = "test-job";
        String userId = "test-user";
        setupFileAndJobMock(fileId, jobId, userId);

        when(uploadFileRepository.countByUploadJobId(jobId)).thenReturn(3L);
        when(uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.FAILED)).thenReturn(0L);
        when(uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.COMPLETED)).thenReturn(1L);

        // when
        fileProcessService.processUploadedFile(fileId, "text", "[{\"question\":\"Q\"}]");

        // then
        triggerAfterCommit();
        verify(notificationService, never()).sendLabelingCompleteNotification(any(), any(), anyLong(), anyLong());
    }

    @Test
    @DisplayName("라벨링 JSON 파싱 실패 -> 저장안됨, failLabeling 호출, 완료 여부 확인")
    void processUploadedFile_invalidJson_fail() {
        // given
        String fileId = "test-file";
        String jobId = "test-job";
        String userId = "test-user";
        UploadFile file = setupFileAndJobMock(fileId, jobId, userId);

        when(uploadFileRepository.countByUploadJobId(jobId)).thenReturn(1L);
        when(uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.FAILED)).thenReturn(1L);
        when(uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.COMPLETED)).thenReturn(0L);

        // when
        fileProcessService.processUploadedFile(fileId, "text", "invalid-json");

        // then
        verify(file, times(1)).failLabeling();
        verify(uploadFileRepository, times(1)).flush();

        triggerAfterCommit();
        verify(notificationService, times(1))
                .sendLabelingCompleteNotification(userId, jobId, 0L, 1L);
    }

    @Test
    @DisplayName("processFailedFile 호출 -> failExtract 호출, 완료 여부 확인")
    void processFailedFile_success() {
        // given
        String fileId = "test-file";
        String jobId = "test-job";
        String userId = "test-user";
        UploadFile file = setupFileAndJobMock(fileId, jobId, userId);

        when(uploadFileRepository.countByUploadJobId(jobId)).thenReturn(1L);
        when(uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.FAILED)).thenReturn(1L);
        when(uploadFileRepository.countByUploadJobIdAndStatus(jobId, UploadStatus.COMPLETED)).thenReturn(0L);

        // when
        fileProcessService.processFailedFile(fileId, "S3 추출 단계에서 에러");

        // then
        verify(file, times(1)).failExtract();
        verify(uploadFileRepository, times(1)).flush();

        triggerAfterCommit();
        verify(notificationService, times(1))
                .sendLabelingCompleteNotification(userId, jobId, 0L, 1L);
    }

    @Test
    @DisplayName("파일이 존재하지 않으면 FILE_NOT_FOUND 예외를 던진다")
    void throwException_when_fileNotFound() {
        // given
        String fileId = "no-file";
        when(uploadFileRepository.findByIdOrElseThrow(fileId))
                .thenThrow(new BaseException(UploadErrorCode.FILE_NOT_FOUND));

        // when  then
        assertThatThrownBy(() -> fileProcessService.processFailedFile(fileId, "error"))
                .isInstanceOf(BaseException.class)
                .extracting("errorCode")
                .isEqualTo(UploadErrorCode.FILE_NOT_FOUND);
    }
}