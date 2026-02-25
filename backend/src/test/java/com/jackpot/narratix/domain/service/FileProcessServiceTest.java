package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.entity.UploadJob;
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
    private JobCompletionService jobCompletionService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private FileProcessService fileProcessService;

    // 💡 추가됨: 단위 테스트 환경에서 강제로 트랜잭션 동기화를 활성화합니다.
    @BeforeEach
    void setUp() {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.initSynchronization();
        }
    }

    // 💡 추가됨: 다음 테스트에 영향을 주지 않도록 트랜잭션 동기화를 초기화합니다.
    @AfterEach
    void tearDown() {
        TransactionSynchronizationManager.clear();
    }

    private UploadFile setupFileAndJobMock(String fileId, String jobId) {
        UploadFile file = mock(UploadFile.class);
        UploadJob job = mock(UploadJob.class);

        when(uploadFileRepository.findByIdForUpdateOrElseThrow(fileId)).thenReturn(file);
        lenient().when(file.isFinalized()).thenReturn(false);
        lenient().when(file.getUploadJob()).thenReturn(job);
        lenient().when(job.getId()).thenReturn(jobId);

        return file;
    }

    private void triggerAfterCommit() {
        for (TransactionSynchronization synchronization : TransactionSynchronizationManager.getSynchronizations()) {
            synchronization.afterCommit();
        }
    }

    @Test
    @DisplayName("파일 추출 및 라벨링 성공 -> JobCompletionService 호출")
    void processUploadedFile_success() {
        // given
        String fileId = "test-file";
        String jobId = "test-job";
        String extractedText = "테스트 텍스트";
        String labelingJson = "[{\"question\":\"Q\",\"answer\":\"A\",\"questionCategory\":\"MOTIVATION\"}]";

        UploadFile file = setupFileAndJobMock(fileId, jobId);

        // when
        fileProcessService.processUploadedFile(fileId, extractedText, labelingJson);

        // then
        verify(file, times(1)).successExtract(extractedText);
        verify(file, times(1)).successLabeling();

        triggerAfterCommit();
        verify(jobCompletionService, times(1)).checkAndNotify(jobId);
    }

    @Test
    @DisplayName("라벨링 JSON 파싱 실패 -> failLabeling 호출 후 JobCompletionService 호출")
    void processUploadedFile_invalidJson_fail() {
        // given
        String fileId = "test-file";
        String jobId = "test-job";

        UploadFile file = setupFileAndJobMock(fileId, jobId);

        // when
        fileProcessService.processUploadedFile(fileId, "text", "invalid-json");

        // then
        verify(file, times(1)).failLabeling();
        triggerAfterCommit();
        verify(jobCompletionService, times(1)).checkAndNotify(jobId);
    }

    @Test
    @DisplayName("processFailedFile 호출 -> failExtract 호출 후 JobCompletionService 호출")
    void processFailedFile_success() {
        // given
        String fileId = "test-file";
        String jobId = "test-job";

        UploadFile file = setupFileAndJobMock(fileId, jobId);

        // when
        fileProcessService.processFailedFile(fileId, "S3 추출 단계에서 에러");

        // then
        verify(file, times(1)).failExtract();

        triggerAfterCommit();
        verify(jobCompletionService, times(1)).checkAndNotify(jobId);
    }

    @Test
    @DisplayName("이미 완료된 파일(isFinalized = true)인 경우 처리 스킵")
    void processUploadedFile_skip_when_finalized() {
        // given
        String fileId = "test-file";
        UploadFile file = mock(UploadFile.class);

        when(uploadFileRepository.findByIdForUpdateOrElseThrow(fileId)).thenReturn(file);
        when(file.isFinalized()).thenReturn(true);

        // when
        fileProcessService.processUploadedFile(fileId, "text", "json");

        // then
        verify(file, never()).successExtract(anyString());
        verify(file, never()).successLabeling();
        verify(jobCompletionService, never()).checkAndNotify(any());
    }

    @Test
    @DisplayName("파일이 존재하지 않으면 FILE_NOT_FOUND 예외를 던진다")
    void throwException_when_fileNotFound() {
        // given
        String fileId = "no-file";

        when(uploadFileRepository.findByIdForUpdateOrElseThrow(fileId))
                .thenThrow(new BaseException(UploadErrorCode.FILE_NOT_FOUND));

        // when then
        assertThatThrownBy(() -> fileProcessService.processFailedFile(fileId, "error"))
                .isInstanceOf(BaseException.class)
                .extracting("errorCode")
                .isEqualTo(UploadErrorCode.FILE_NOT_FOUND);
    }
}