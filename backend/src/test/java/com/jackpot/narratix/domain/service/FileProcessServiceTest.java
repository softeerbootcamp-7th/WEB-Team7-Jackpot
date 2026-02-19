package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.repository.LabeledQnARepository;
import com.jackpot.narratix.domain.repository.UploadFileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class FileProcessServiceTest {

    @Mock
    private UploadFileRepository uploadFileRepository;

    @InjectMocks
    private FileProcessService fileProcessService;

    @Mock
    private LabeledQnARepository labeledQnARepository;

    @Test
    @DisplayName("파일 추출 성공 : UploadFile.successExtract() 호출")
    void saveExtractSuccess_callsSuccessExtract() {

        UploadFile file = mock(UploadFile.class);
        fileProcessService.saveExtractSuccess(file, "text");
        verify(file, times(1)).successExtract("text");
    }

    @Test
    @DisplayName("파일 추출 실패 : UploadFile.failExtract() 호출 ")
    void saveExtractFail_callsFailExtract() {

        UploadFile file = mock(UploadFile.class);
        fileProcessService.saveExtractFail(file, "error");
        verify(file, times(1)).failExtract();
    }

    @Test
    @DisplayName("파일 ai 라벨링 실패 : UploadFile.failLabeling() 호출 ")
    void saveLabelingFail_callsFailLabeling() {

        UploadFile file = mock(UploadFile.class);
        fileProcessService.saveLabelingFail(file);
        verify(file, times(1)).failLabeling();
    }

    @Test
    @DisplayName("파일 ai 라벨링 성공 : DB 저장 및 상태 완료 변경")
    void saveLabelingResult_success() {
        // given
        String fileId = "test-id";
        String jsonResult = "[{\"question\":\"Q\",\"answer\":\"A\",\"questionCategory\":\"MOTIVATION\"}]";

        UploadFile file = spy(UploadFile.builder().id(fileId).build());

        when(uploadFileRepository.findById(fileId)).thenReturn(Optional.of(file));

        // when
        fileProcessService.saveLabelingResult(fileId, jsonResult);

        // then
        verify(file, times(1)).successLabeling();
        verify(labeledQnARepository, atLeastOnce()).save(any());
    }
}