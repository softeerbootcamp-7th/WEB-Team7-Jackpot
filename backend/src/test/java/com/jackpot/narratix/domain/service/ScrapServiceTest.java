package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.request.CreateScrapRequest;
import com.jackpot.narratix.domain.controller.response.CreateScrapResponse;
import com.jackpot.narratix.domain.controller.response.ScrapCountResponse;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.Scrap;
import com.jackpot.narratix.domain.entity.ScrapId;
import com.jackpot.narratix.domain.exception.ScrapErrorCode;
import com.jackpot.narratix.domain.fixture.QnAFixture;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ScrapRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static com.jackpot.narratix.domain.entity.enums.QuestionCategoryType.MOTIVATION;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScrapServiceTest {

    @InjectMocks
    private ScrapService scrapService;

    @Mock
    private ScrapRepository scrapRepository;

    @Mock
    private QnARepository qnARepository;

    @Test
    @DisplayName("스크랩 성공")
    void createScrap_Success() {
        // given
        String userId = "user123";
        Long qnaId = 1L;
        CreateScrapRequest request = new CreateScrapRequest(qnaId);

        ScrapId expectedScrapId = new ScrapId(userId, qnaId);

        when(scrapRepository.existsById(expectedScrapId)).thenReturn(false);
        when(scrapRepository.countByUserId(userId)).thenReturn(1L);

        // when
        CreateScrapResponse response = scrapService.createScrap(userId, request);

        // then - response
        assertThat(response.qnaId()).isEqualTo(qnaId);
        assertThat(response.scrapCount()).isEqualTo(1L);

        verify(scrapRepository, times(1)).existsById(expectedScrapId);

        ArgumentCaptor<Scrap> scrapCaptor = ArgumentCaptor.forClass(Scrap.class);
        verify(scrapRepository, times(1)).save(scrapCaptor.capture());

        Scrap savedScrap = scrapCaptor.getValue();
        assertThat(savedScrap.getId()).isNotNull();
        assertThat(savedScrap.getId().getUserId()).isEqualTo(userId);
        assertThat(savedScrap.getId().getQnaId()).isEqualTo(qnaId);

        InOrder inOrder = inOrder(scrapRepository);
        inOrder.verify(scrapRepository).existsById(expectedScrapId);
        inOrder.verify(scrapRepository).save(any(Scrap.class));
        inOrder.verify(scrapRepository).countByUserId(userId);

    }

    @Test
    @DisplayName("스크랩 실패 - 이미 중복된 스크랩이 있는 경우")
    void createScrap_Fail_Duplicate() {
        // given
        String userId = "user123";
        Long qnaId = 1L;
        CreateScrapRequest request = new CreateScrapRequest(qnaId);

        ScrapId expectedScrapId = new ScrapId(userId, qnaId);

        when(scrapRepository.existsById(expectedScrapId)).thenReturn(true);

        // when
        BaseException exception = assertThrows(BaseException.class,
                () -> scrapService.createScrap(userId, request));

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ScrapErrorCode.DUPLICATE_SCRAP);

        verify(scrapRepository, times(1)).existsById(expectedScrapId);
        verify(scrapRepository, never()).save(any(Scrap.class));
        verify(scrapRepository, never()).countByUserId(anyString());
    }


    @Test
    @DisplayName("스크랩 개수 확인 - 해당 유저의 스크랩 개수 반환")
    void getScrapCount_ReturnCount() {
        // given
        String userId = "user123";
        long expectedCount = 5L;
        when(scrapRepository.countByUserId(userId)).thenReturn(expectedCount);

        // when
        ScrapCountResponse response = scrapService.getScrapCount(userId);

        // then
        assertThat(response.scrapCount()).isEqualTo(expectedCount);
        verify(scrapRepository, times(1)).countByUserId(userId);
    }

    @Test
    @DisplayName("스크랩 삭제 - 성공")
    void deleteScrap_Sucess() {
        // given
        String userId = "user123";
        Long qnaId = 1L;
        QnA qna = QnAFixture.createQnA(null, userId, "question", MOTIVATION);
        when(qnARepository.findByIdOrElseThrow(qnaId)).thenReturn(qna);
        when(scrapRepository.countByUserId(userId)).thenReturn(0L);

        //when
        ScrapCountResponse response = scrapService.deleteScrapById(userId, qnaId);
        assertThat(response.scrapCount()).isEqualTo(0L);
        verify(scrapRepository).deleteById(any(ScrapId.class));
        verify(scrapRepository).countByUserId(userId);
    }

    @Test
    @DisplayName("스크랩 삭제 - 본인 문항이 아닌 경우 스크랩 삭제 시도 시 예외 발생")
    void deleteScrap_Fail_Forbidden() {
        // given
        String userId = "user123";
        Long qnaId = 1L;

        String otherUserId = "otherUser";

        QnA qna = QnAFixture.createQnA(
                null,
                otherUserId,
                "question",
                MOTIVATION
        );

        when(qnARepository.findByIdOrElseThrow(qnaId)).thenReturn(qna);

        // when
        BaseException exception = assertThrows(BaseException.class,
                () -> scrapService.deleteScrapById(userId, qnaId));

        // then
        assertThat(exception.getErrorCode()).isEqualTo(GlobalErrorCode.FORBIDDEN);

        verify(qnARepository, times(1)).findByIdOrElseThrow(qnaId);

        verify(scrapRepository, never()).deleteById(any(ScrapId.class));
        verify(scrapRepository, never()).countByUserId(anyString());
    }
}