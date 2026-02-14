package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.entity.UploadFile;
import com.jackpot.narratix.domain.entity.enums.UploadStatus;
import com.jackpot.narratix.domain.repository.UploadFileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class FileProcessServiceTest {

    @Mock
    private UploadFileRepository uploadFileRepository;

    @InjectMocks
    private FileProcessService fileProcessService;

    @Test
    @DisplayName("파일 추출 성공 : EXTRACTED 로 상태 변경")
    void processUploadedFile_Success() {
        // given
        String fileId = "test";
        String extractedText = "자기소개서 내용입니다.";

        // 실제 엔티티 객체 생성 (PENDING 상태로 시작)
        UploadFile uploadFile = UploadFile.builder()
                .id(fileId)
                .originalFileName("test.pdf")
                .s3Key("s3/path/test.pdf")
                .build();

        given(uploadFileRepository.findById(fileId)).willReturn(Optional.of(uploadFile));

        // when
        fileProcessService.processUploadedFile(fileId, extractedText);

        // then
        assertThat(uploadFile.getStatus()).isEqualTo(UploadStatus.EXTRACTED);
        assertThat(uploadFile.getExtractedText()).isEqualTo(extractedText);

        verify(uploadFileRepository, times(1)).findById(fileId);
    }

    @Test
    @DisplayName("파일 추출 실패 : FAILED로 상태 변경")
    void processFailedFile_Success() {
        // given
        String fileId = "test";
        UploadFile uploadFile = UploadFile.builder()
                .id(fileId)
                .originalFileName("test.pdf")
                .s3Key("s3/path/test.pdf")
                .build();

        given(uploadFileRepository.findById(fileId)).willReturn(Optional.of(uploadFile));

        // when
        fileProcessService.processFailedFile(fileId, "에러");

        // then
        // 1. 엔티티 상태 검증
        assertThat(uploadFile.getStatus()).isEqualTo(UploadStatus.FAILED);
        assertThat(uploadFile.getExtractedText()).isNull();

        // 2. 리포지토리 호출 검증
        verify(uploadFileRepository, times(1)).findById(fileId);
    }

    @Test
    @DisplayName("존재하지 않는 파일 ID로 요청 : 아무런 동작도 하지 않고 로그만 남김")
    void processFile_NotFound() {
        // given
        String fileId = "non-existent-id";
        given(uploadFileRepository.findById(fileId)).willReturn(Optional.empty());

        // when
        fileProcessService.processUploadedFile(fileId, "some text");
        fileProcessService.processFailedFile(fileId, "error");

        // then
        verifyNoInteractions(mock(UploadFile.class));
        verify(uploadFileRepository, times(2)).findById(fileId);
    }
}