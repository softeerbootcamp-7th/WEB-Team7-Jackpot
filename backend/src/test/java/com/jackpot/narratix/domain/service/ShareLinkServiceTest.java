package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.ShareLinkActiveResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.ShareLink;
import com.jackpot.narratix.domain.exception.CoverLetterErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.ShareLinkRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShareLinkServiceTest {

    @InjectMocks
    private ShareLinkService shareLinkService;

    @Mock
    private CoverLetterRepository coverLetterRepository;

    @Mock
    private ShareLinkRepository shareLinkRepository;

    @Test
    @DisplayName("첨삭 링크 활성화 시 첨삭 링크가 없다면 새로운 링크 생성")
    void updateShareLinkStatus_WhenActivatingNewLink_ShouldCreateNewShareLink() {
        // given
        String userId = "testUser";
        Long coverLetterId = 1L;
        boolean active = true;

        CoverLetter mockCoverLetter = mock(CoverLetter.class);
        ShareLink mockShareLink = mock(ShareLink.class);
        String expectedShareId = "test-share-id-123";

        given(coverLetterRepository.findByIdOrElseThrow(coverLetterId)).willReturn(mockCoverLetter);
        given(mockCoverLetter.isOwner(userId)).willReturn(true);
        given(shareLinkRepository.findById(coverLetterId)).willReturn(Optional.empty());
        given(shareLinkRepository.save(any(ShareLink.class))).willReturn(mockShareLink);
        given(mockShareLink.getShareId()).willReturn(expectedShareId);

        // when
        ShareLinkActiveResponse response = shareLinkService.updateShareLinkStatus(userId, coverLetterId, active);

        // then
        assertThat(response).isNotNull();
        assertThat(response.active()).isTrue();
        assertThat(response.shareLinkId()).isEqualTo(expectedShareId);

        verify(coverLetterRepository, times(1)).findByIdOrElseThrow(coverLetterId);
        verify(shareLinkRepository, times(1)).findById(coverLetterId);
        verify(shareLinkRepository, times(1)).save(any(ShareLink.class));
    }

    @Test
    @DisplayName("첨삭 링크 비활성화시 기존 링크가 있는 경우 기존 링크를 비활성화 함")
    void updateShareLinkStatus_WhenDeactivatingWithExistingLink_ShouldDeactivateLink() {
        // given
        String userId = "testUser";
        Long coverLetterId = 1L;
        boolean active = false;

        CoverLetter mockCoverLetter = mock(CoverLetter.class);
        ShareLink mockShareLink = mock(ShareLink.class);

        given(coverLetterRepository.findByIdOrElseThrow(coverLetterId)).willReturn(mockCoverLetter);
        given(mockCoverLetter.isOwner(userId)).willReturn(true);
        given(shareLinkRepository.findById(coverLetterId)).willReturn(Optional.of(mockShareLink));

        // when
        ShareLinkActiveResponse response = shareLinkService.updateShareLinkStatus(userId, coverLetterId, active);

        // then
        assertThat(response).isNotNull();
        assertThat(response.active()).isFalse();
        assertThat(response.shareLinkId()).isNull();

        verify(coverLetterRepository, times(1)).findByIdOrElseThrow(coverLetterId);
        verify(shareLinkRepository, times(1)).findById(coverLetterId);
        verify(mockShareLink, times(1)).deactivate();
    }

    @Test
    @DisplayName("첨삭 링크 비활성화 시 기존 링크가 없는 경우 아무 일도 일어나지 않음")
    void updateShareLinkStatus_WhenDeactivatingWithoutExistingLink_ShouldReturnInactiveResponse() {
        // given
        String userId = "testUser";
        Long coverLetterId = 1L;
        boolean active = false;

        CoverLetter mockCoverLetter = mock(CoverLetter.class);

        given(coverLetterRepository.findByIdOrElseThrow(coverLetterId)).willReturn(mockCoverLetter);
        given(mockCoverLetter.isOwner(userId)).willReturn(true);
        given(shareLinkRepository.findById(coverLetterId)).willReturn(Optional.empty());

        // when
        ShareLinkActiveResponse response = shareLinkService.updateShareLinkStatus(userId, coverLetterId, active);

        // then
        assertThat(response).isNotNull();
        assertThat(response.active()).isFalse();
        assertThat(response.shareLinkId()).isNull();

        verify(coverLetterRepository, times(1)).findByIdOrElseThrow(coverLetterId);
        verify(shareLinkRepository, times(1)).findById(coverLetterId);
        verify(shareLinkRepository, never()).save(any(ShareLink.class));
    }

    @Test
    @DisplayName("첨삭 링크 활성화 시 다른 사용자의 자기소개서라면 에러 발생")
    void updateShareLinkStatus_WhenUserIsNotOwner_ShouldThrowForbiddenException() {
        // given
        String userId = "testUser";
        Long coverLetterId = 1L;
        boolean active = true;

        CoverLetter mockCoverLetter = mock(CoverLetter.class);

        given(coverLetterRepository.findByIdOrElseThrow(coverLetterId)).willReturn(mockCoverLetter);
        given(mockCoverLetter.isOwner(userId)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> shareLinkService.updateShareLinkStatus(userId, coverLetterId, active))
                .isInstanceOf(BaseException.class)
                .hasMessage(GlobalErrorCode.FORBIDDEN.getMessage())
                .extracting("errorCode")
                .isEqualTo(GlobalErrorCode.FORBIDDEN);

        verify(coverLetterRepository, times(1)).findByIdOrElseThrow(coverLetterId);
        verify(shareLinkRepository, never()).findById(any());
        verify(shareLinkRepository, never()).save(any());
    }

    @Test
    @DisplayName("첨삭 링크 활성화 시 존재하지 않는 자기소개서라면 NotFound 에러 발생")
    void updateShareLinkStatus_WhenCoverLetterNotFound_ShouldThrowException() {
        // given
        String userId = "testUser";
        Long coverLetterId = 999L;
        boolean active = true;

        given(coverLetterRepository.findByIdOrElseThrow(coverLetterId))
                .willThrow(new BaseException(CoverLetterErrorCode.COVER_LETTER_NOT_FOUND));

        // when & then
        assertThatThrownBy(() -> shareLinkService.updateShareLinkStatus(userId, coverLetterId, active))
                .isInstanceOf(BaseException.class);

        verify(coverLetterRepository, times(1)).findByIdOrElseThrow(coverLetterId);
        verify(shareLinkRepository, never()).findById(any());
    }

    @Test
    @DisplayName("첨삭 링크 상태 조회 시 활성화되고 만료되지 않은 링크는 active=true를 반환한다")
    void getShareLinkStatus_WhenActivatedAndNotExpired_ReturnsActiveTrue() {
        // given
        String userId = "testUser";
        Long coverLetterId = 1L;

        CoverLetter mockCoverLetter = mock(CoverLetter.class);
        ShareLink mockShareLink = mock(ShareLink.class);
        String expectedShareId = "test-share-id-123";

        given(coverLetterRepository.findByIdOrElseThrow(coverLetterId)).willReturn(mockCoverLetter);
        given(mockCoverLetter.isOwner(userId)).willReturn(true);
        given(shareLinkRepository.findById(coverLetterId)).willReturn(Optional.of(mockShareLink));
        given(mockShareLink.isValid()).willReturn(true);
        given(mockShareLink.getShareId()).willReturn(expectedShareId);

        // when
        ShareLinkActiveResponse response = shareLinkService.getShareLinkStatus(userId, coverLetterId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.active()).isTrue();
        assertThat(response.shareLinkId()).isEqualTo(expectedShareId);

        verify(mockShareLink, times(1)).isValid();
    }

    @Test
    @DisplayName("첨삭 링크 상태 조회 시 만료된 링크는 active=false를 반환한다")
    void getShareLinkStatus_WhenExpired_ReturnsActiveFalse() {
        // given
        String userId = "testUser";
        Long coverLetterId = 1L;

        CoverLetter mockCoverLetter = mock(CoverLetter.class);
        ShareLink mockShareLink = mock(ShareLink.class);

        given(coverLetterRepository.findByIdOrElseThrow(coverLetterId)).willReturn(mockCoverLetter);
        given(mockCoverLetter.isOwner(userId)).willReturn(true);
        given(shareLinkRepository.findById(coverLetterId)).willReturn(Optional.of(mockShareLink));
        given(mockShareLink.isValid()).willReturn(false); // 만료됨

        // when
        ShareLinkActiveResponse response = shareLinkService.getShareLinkStatus(userId, coverLetterId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.active()).isFalse();
        assertThat(response.shareLinkId()).isNull();

        verify(mockShareLink, times(1)).isValid();
    }

    @Test
    @DisplayName("첨삭 링크 상태 조회 시 링크가 존재하지 않으면 active=false를 반환한다")
    void getShareLinkStatus_WhenShareLinkNotExists_ReturnsActiveFalse() {
        // given
        String userId = "testUser";
        Long coverLetterId = 1L;

        CoverLetter mockCoverLetter = mock(CoverLetter.class);

        given(coverLetterRepository.findByIdOrElseThrow(coverLetterId)).willReturn(mockCoverLetter);
        given(mockCoverLetter.isOwner(userId)).willReturn(true);
        given(shareLinkRepository.findById(coverLetterId)).willReturn(Optional.empty());

        // when
        ShareLinkActiveResponse response = shareLinkService.getShareLinkStatus(userId, coverLetterId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.active()).isFalse();
        assertThat(response.shareLinkId()).isNull();
    }

    @Test
    @DisplayName("첨삭 링크 상태 조회 시 다른 사용자의 자기소개서라면 에러 발생")
    void getShareLinkStatus_WhenUserIsNotOwner_ShouldThrowForbiddenException() {
        // given
        String userId = "testUser";
        Long coverLetterId = 1L;

        CoverLetter mockCoverLetter = mock(CoverLetter.class);

        given(coverLetterRepository.findByIdOrElseThrow(coverLetterId)).willReturn(mockCoverLetter);
        given(mockCoverLetter.isOwner(userId)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> shareLinkService.getShareLinkStatus(userId, coverLetterId))
                .isInstanceOf(BaseException.class)
                .hasMessage(GlobalErrorCode.FORBIDDEN.getMessage())
                .extracting("errorCode")
                .isEqualTo(GlobalErrorCode.FORBIDDEN);

        verify(coverLetterRepository, times(1)).findByIdOrElseThrow(coverLetterId);
        verify(shareLinkRepository, never()).findById(any());
    }
}