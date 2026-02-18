package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.repository.UploadFileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class FileProcessFacadeTest {

    @Mock
    private UploadFileRepository uploadFileRepository;

    @Mock
    private AiLabelingService aiLabelingService;

    @Mock
    private FileProcessService fileProcessService;

    @InjectMocks
    private FileProcessFacade fileProcessFacade;

    @Test
    @DisplayName("파일 추출 성공 + AI 라벨링 성공 → ExtractSuccess 저장 후 LabelingSuccess 저장")
    void processUploadedFile_success() {
        // given
        String fileId = "file-1";
        String extractedText = "자기소개서 내용입니다.";
        String labelingJson = "[]";

        UploadFile file = mock(UploadFile.class);

        given(uploadFileRepository.findById(fileId)).willReturn(Optional.of(file));
        given(aiLabelingService.generateLabelingJson(extractedText)).willReturn(labelingJson);

        // when
        fileProcessFacade.processUploadedFile(fileId, extractedText);

        // then
        verify(uploadFileRepository, times(1)).findById(fileId);

        verify(fileProcessService, times(1)).saveExtractSuccess(file, extractedText);
        verify(aiLabelingService, times(1)).generateLabelingJson(extractedText);
        verify(fileProcessService, times(1)).saveLabelingSuccess(file, labelingJson);

        verify(fileProcessService, never()).saveLabelingFail(any());
        verify(fileProcessService, never()).saveExtractFail(any(), any());
    }

    @Test
    @DisplayName("파일 추출 성공 + AI 라벨링 실패 → ExtractSuccess 저장 후 LabelingFail 저장")
    void processUploadedFile_labelingFail() {
        // given
        String fileId = "file-1";
        String extractedText = "자기소개서 내용입니다.";

        UploadFile file = mock(UploadFile.class);

        given(uploadFileRepository.findById(fileId)).willReturn(Optional.of(file));
        given(aiLabelingService.generateLabelingJson(extractedText))
                .willThrow(new RuntimeException("Gemini Error"));

        // when
        fileProcessFacade.processUploadedFile(fileId, extractedText);

        // then
        verify(uploadFileRepository, times(1)).findById(fileId);

        verify(fileProcessService, times(1)).saveExtractSuccess(file, extractedText);
        verify(aiLabelingService, times(1)).generateLabelingJson(extractedText);

        verify(fileProcessService, times(1)).saveLabelingFail(file);
        verify(fileProcessService, never()).saveLabelingSuccess(any(), any());

        verify(fileProcessService, never()).saveExtractFail(any(), any());
    }

    @Test
    @DisplayName("존재하지 않는 fileId → 아무것도 하지 않고 return")
    void processUploadedFile_fileNotFound() {
        // given
        String fileId = "no-file";
        String extractedText = "text";

        given(uploadFileRepository.findById(fileId)).willReturn(Optional.empty());

        // when
        fileProcessFacade.processUploadedFile(fileId, extractedText);

        // then
        verify(uploadFileRepository, times(1)).findById(fileId);

        verifyNoInteractions(aiLabelingService);
        verifyNoInteractions(fileProcessService);
    }

}
