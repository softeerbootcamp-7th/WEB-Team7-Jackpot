package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.CreateScrapRequest;
import com.jackpot.narratix.domain.controller.response.CreateScrapResponse;
import com.jackpot.narratix.domain.entity.Scrap;
import com.jackpot.narratix.domain.entity.ScrapId;
import com.jackpot.narratix.domain.exception.ScrapErrorCode;
import com.jackpot.narratix.domain.repository.ScrapRepository;
import com.jackpot.narratix.global.exception.BaseException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScrapServiceTest {

    @InjectMocks
    private ScrapService scrapService;

    @Mock
    private ScrapRepository scrapRepository;

    @Test
    @DisplayName("스크랩 성공")
    void createScrap_Success() {
        // given
        String userId = "user123";
        Long qnaId = 1L;
        CreateScrapRequest request = new CreateScrapRequest(qnaId);
        ScrapId scrapId = new ScrapId(userId, qnaId);

        // existsById가 false를 반환하도록 설정
        when(scrapRepository.existsById(scrapId)).thenReturn(false);
        // countByUserId가 1을 반환하도록 설정
        when(scrapRepository.countByUserId(userId)).thenReturn(1L);

        // when
        CreateScrapResponse response = scrapService.createScrap(userId, request);

        // then
        assertThat(response.qnaId()).isEqualTo(qnaId);
        assertThat(response.scrapCount()).isEqualTo(1L);

        verify(scrapRepository, times(1)).save(any(Scrap.class));
    }

    @Test
    @DisplayName("스크랩 실패 - 이미 중복된 스크랩이 있는 경우")
    void createScrap_Fail_Duplicate() {
        // given
        String userId = "user123";
        Long qnaId = 1L;
        ScrapId scrapId = new ScrapId(userId, qnaId);
        CreateScrapRequest request = new CreateScrapRequest(qnaId);


        when(scrapRepository.existsById(scrapId)).thenReturn(true);

        // when & then
        BaseException exception = assertThrows(BaseException.class, () -> {
            scrapService.createScrap(userId, request);
        });

        assertThat(exception.getErrorCode()).isEqualTo(ScrapErrorCode.DUPLICATE_SCRAP);

        verify(scrapRepository, never()).save(any(Scrap.class));
    }
}