package com.jackpot.narratix.domain.service;

import com.jackpot.narratix.domain.controller.response.CoverLetterAndQnAIdsResponse;
import com.jackpot.narratix.domain.controller.response.QnAVersionResponse;
import com.jackpot.narratix.domain.controller.response.ShareLinkActiveResponse;
import com.jackpot.narratix.domain.entity.CoverLetter;
import com.jackpot.narratix.domain.entity.QnA;
import com.jackpot.narratix.domain.entity.ShareLink;
import com.jackpot.narratix.domain.exception.CoverLetterErrorCode;
import com.jackpot.narratix.domain.exception.ShareLinkErrorCode;
import com.jackpot.narratix.domain.repository.CoverLetterRepository;
import com.jackpot.narratix.domain.repository.QnARepository;
import com.jackpot.narratix.domain.repository.ShareLinkRepository;
import com.jackpot.narratix.global.exception.BaseException;
import com.jackpot.narratix.global.exception.GlobalErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
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
    private QnARepository qnARepository;

    @Mock
    private ShareLinkRepository shareLinkRepository;

    @Mock
    private ShareLinkLockManager shareLinkLockManager;

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
    @DisplayName("getQnAWithVersion: 유효한 shareId와 qnAId로 QnA 버전 정보 조회 성공")
    void getQnAWithVersion_WhenValidShareIdAndQnAId_ShouldReturnQnAVersionResponse() {
        // given
        String userId = "testUser";
        String shareId = "valid-share-id";
        Long qnAId = 1L;
        Long coverLetterId = 10L;

        ShareLink mockShareLink = mock(ShareLink.class);
        QnA mockQnA = mock(QnA.class);
        CoverLetter mockCoverLetter = mock(CoverLetter.class);

        given(shareLinkRepository.findByShareId(shareId)).willReturn(Optional.of(mockShareLink));
        given(mockShareLink.isValid()).willReturn(true);
        given(mockShareLink.getCoverLetterId()).willReturn(coverLetterId);
        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(mockQnA);
        given(mockQnA.getCoverLetter()).willReturn(mockCoverLetter);
        given(mockCoverLetter.getId()).willReturn(coverLetterId);
        given(mockQnA.getId()).willReturn(qnAId);
        given(mockQnA.getQuestion()).willReturn("테스트 질문");
        given(mockQnA.getAnswer()).willReturn("테스트 답변");
        given(mockQnA.getVersion()).willReturn(0L);

        // when
        QnAVersionResponse response = shareLinkService.getQnAWithVersion(userId, shareId, qnAId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.qnAId()).isEqualTo(qnAId);
        assertThat(response.question()).isEqualTo("테스트 질문");
        assertThat(response.answer()).isEqualTo("테스트 답변");
        assertThat(response.version()).isZero();
    }

    @Test
    @DisplayName("getQnAWithVersion: 존재하지 않는 shareId로 조회 시 SHARE_LINK_NOT_FOUND 에러 발생")
    void getQnAWithVersion_WhenShareLinkNotFound_ShouldThrowException() {
        // given
        String userId = "testUser";
        String shareId = "invalid-share-id";
        Long qnAId = 1L;

        given(shareLinkRepository.findByShareId(shareId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> shareLinkService.getQnAWithVersion(userId, shareId, qnAId))
                .isInstanceOf(BaseException.class)
                .extracting("errorCode")
                .isEqualTo(ShareLinkErrorCode.SHARE_LINK_NOT_FOUND);
    }

    @Test
    @DisplayName("getQnAWithVersion: 만료된 첨삭 링크로 조회 시 SHARE_LINK_EXPIRED 에러 발생")
    void getQnAWithVersion_WhenShareLinkExpired_ShouldThrowException() {
        // given
        String userId = "testUser";
        String shareId = "expired-share-id";
        Long qnAId = 1L;

        ShareLink mockShareLink = mock(ShareLink.class);

        given(shareLinkRepository.findByShareId(shareId)).willReturn(Optional.of(mockShareLink));
        given(mockShareLink.isValid()).willReturn(false);

        // when & then
        assertThatThrownBy(() -> shareLinkService.getQnAWithVersion(userId, shareId, qnAId))
                .isInstanceOf(BaseException.class)
                .extracting("errorCode")
                .isEqualTo(ShareLinkErrorCode.SHARE_LINK_EXPIRED);
    }

    @Test
    @DisplayName("getQnAWithVersion: QnA가 해당 첨삭 링크의 자기소개서에 속하지 않으면 FORBIDDEN 에러 발생")
    void getQnAWithVersion_WhenQnANotBelongsToShareLink_ShouldThrowForbiddenException() {
        // given
        String userId = "testUser";
        String shareId = "valid-share-id";
        Long qnAId = 1L;
        Long shareLinkCoverLetterId = 10L;
        Long differentCoverLetterId = 99L;

        ShareLink mockShareLink = mock(ShareLink.class);
        QnA mockQnA = mock(QnA.class);
        CoverLetter mockCoverLetter = mock(CoverLetter.class);

        given(shareLinkRepository.findByShareId(shareId)).willReturn(Optional.of(mockShareLink));
        given(mockShareLink.isValid()).willReturn(true);
        given(mockShareLink.getCoverLetterId()).willReturn(shareLinkCoverLetterId);
        given(qnARepository.findByIdOrElseThrow(qnAId)).willReturn(mockQnA);
        given(mockQnA.getCoverLetter()).willReturn(mockCoverLetter);
        given(mockCoverLetter.getId()).willReturn(differentCoverLetterId);

        // when & then
        assertThatThrownBy(() -> shareLinkService.getQnAWithVersion(userId, shareId, qnAId))
                .isInstanceOf(BaseException.class)
                .extracting("errorCode")
                .isEqualTo(GlobalErrorCode.FORBIDDEN);
    }

    @Test
    @DisplayName("getCoverLetterAndQnAIds: 유효한 shareId로 자기소개서 및 QnA ID 목록 조회 성공")
    void getCoverLetterAndQnAIds_WhenValidShareId_ShouldReturnResponse() {
        // given
        String userId = "testUser";
        String shareId = "valid-share-id";
        Long coverLetterId = 10L;

        ShareLink mockShareLink = mock(ShareLink.class);
        CoverLetter mockCoverLetter = mock(CoverLetter.class);

        given(shareLinkRepository.findByShareId(shareId)).willReturn(Optional.of(mockShareLink));
        given(mockShareLink.isValid()).willReturn(true);
        given(mockShareLink.getCoverLetterId()).willReturn(coverLetterId);
        given(coverLetterRepository.findByIdOrElseThrow(coverLetterId)).willReturn(mockCoverLetter);
        given(mockCoverLetter.getId()).willReturn(coverLetterId);
        given(qnARepository.findIdsByCoverLetterId(coverLetterId)).willReturn(List.of(1L, 2L));
        given(mockCoverLetter.getCompanyName()).willReturn("테스트 기업");
        given(mockCoverLetter.getJobPosition()).willReturn("백엔드 개발자");

        // when
        CoverLetterAndQnAIdsResponse response = shareLinkService.getCoverLetterAndQnAIds(userId, shareId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.coverLetter().coverLetterId()).isEqualTo(coverLetterId);
        assertThat(response.coverLetter().companyName()).isEqualTo("테스트 기업");
        assertThat(response.coverLetter().jobPosition()).isEqualTo("백엔드 개발자");
        assertThat(response.qnAIds()).containsExactly(1L, 2L);
    }

    @Test
    @DisplayName("getCoverLetterAndQnAIds: 존재하지 않는 shareId로 조회 시 SHARE_LINK_NOT_FOUND 에러 발생")
    void getCoverLetterAndQnAIds_WhenShareLinkNotFound_ShouldThrowException() {
        // given
        String userId = "testUser";
        String shareId = "invalid-share-id";

        given(shareLinkRepository.findByShareId(shareId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> shareLinkService.getCoverLetterAndQnAIds(userId, shareId))
                .isInstanceOf(BaseException.class)
                .extracting("errorCode")
                .isEqualTo(ShareLinkErrorCode.SHARE_LINK_NOT_FOUND);
    }

    @Test
    @DisplayName("getCoverLetterAndQnAIds: 만료된 첨삭 링크로 조회 시 SHARE_LINK_EXPIRED 에러 발생")
    void getCoverLetterAndQnAIds_WhenShareLinkExpired_ShouldThrowException() {
        // given
        String userId = "testUser";
        String shareId = "expired-share-id";

        ShareLink mockShareLink = mock(ShareLink.class);

        given(shareLinkRepository.findByShareId(shareId)).willReturn(Optional.of(mockShareLink));
        given(mockShareLink.isValid()).willReturn(false);

        // when & then
        assertThatThrownBy(() -> shareLinkService.getCoverLetterAndQnAIds(userId, shareId))
                .isInstanceOf(BaseException.class)
                .extracting("errorCode")
                .isEqualTo(ShareLinkErrorCode.SHARE_LINK_EXPIRED);
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