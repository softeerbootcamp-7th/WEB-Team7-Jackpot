package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.exception.UploadErrorCode;
import com.jackpot.narratix.domain.repository.LabeledQnARepository;
import com.jackpot.narratix.domain.repository.UploadFileRepository;
import com.jackpot.narratix.global.exception.BaseException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class FileProcessServiceTest {

    @Mock
    private UploadFileRepository uploadFileRepository;

    @Mock
    private LabeledQnARepository labeledQnARepository;

    @InjectMocks
    private FileProcessService fileProcessService;

    @Test
    @DisplayName("파일 추출 성공 + 라벨링 성공 : successExtract, saveAll, successLabeling 호출")
    void processUploadedFile_success() {
        // given
        String fileId = "test-id";
        String extractedText = "자기소개서 텍스트";
        String labelingJson = "[{\"question\":\"Q\",\"answer\":\"A\",\"questionCategory\":\"MOTIVATION\"}]";

        UploadFile file = mock(UploadFile.class);
        when(uploadFileRepository.findById(fileId)).thenReturn(Optional.of(file));

        // when
        fileProcessService.processUploadedFile(fileId, extractedText, labelingJson);

        // then
        verify(file, times(1)).successExtract(extractedText);
        verify(labeledQnARepository, times(1)).saveAll(anyList());
        verify(file, times(1)).successLabeling();
        verify(file, never()).failLabeling();
    }

    @Test
    @DisplayName("라벨링 JSON이 null : successExtract 후 failLabeling 호출")
    void processUploadedFile_labelingJsonNull() {
        // given
        String fileId = "test-id";
        String extractedText = "자기소개서 텍스트";

        UploadFile file = mock(UploadFile.class);
        when(uploadFileRepository.findById(fileId)).thenReturn(Optional.of(file));

        // when
        fileProcessService.processUploadedFile(fileId, extractedText, null);

        // then
        verify(file, times(1)).successExtract(extractedText);
        verify(file, times(1)).failLabeling();
        verify(file, never()).successLabeling();
        verify(labeledQnARepository, never()).saveAll(anyList());
    }

    @Test
    @DisplayName("라벨링 JSON 파싱 실패 : successExtract 후 failLabeling 호출")
    void processUploadedFile_labelingJsonParseError() {
        // given
        String fileId = "test-id";
        String extractedText = "자기소개서 텍스트";
        String invalidJson = "invalid json";

        UploadFile file = mock(UploadFile.class);
        when(uploadFileRepository.findById(fileId)).thenReturn(Optional.of(file));

        // when
        fileProcessService.processUploadedFile(fileId, extractedText, invalidJson);

        // then
        verify(file, times(1)).successExtract(extractedText);
        verify(file, times(1)).failLabeling();
        verify(file, never()).successLabeling();
        verify(labeledQnARepository, never()).saveAll(anyList());
    }

    @Test
    @DisplayName("파일 없음 : BaseException(FILE_NOT_FOUND) 발생")
    void processUploadedFile_fileNotFound() {
        // given
        String fileId = "no-file";
        when(uploadFileRepository.findById(fileId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> fileProcessService.processUploadedFile(fileId, "text", "[]"))
                .isInstanceOf(BaseException.class)
                .extracting("errorCode")
                .isEqualTo(UploadErrorCode.FILE_NOT_FOUND);
    }

    @Test
    @DisplayName("파일 추출 실패 : failExtract 호출")
    void processFailedFile_callsFailExtract() {
        // given
        String fileId = "test-id";
        UploadFile file = mock(UploadFile.class);
        when(uploadFileRepository.findById(fileId)).thenReturn(Optional.of(file));

        // when
        fileProcessService.processFailedFile(fileId, "error message");

        // then
        verify(file, times(1)).failExtract();
    }

    @Test
    @DisplayName("파일 추출 실패 + 파일 없음 : 아무것도 하지 않고 return")
    void processFailedFile_fileNotFound() {
        // given
        String fileId = "no-file";
        when(uploadFileRepository.findById(fileId)).thenReturn(Optional.empty());

        // when & then (no exception thrown)
        fileProcessService.processFailedFile(fileId, "error message");

        verify(uploadFileRepository, times(1)).findById(fileId);
    }
}