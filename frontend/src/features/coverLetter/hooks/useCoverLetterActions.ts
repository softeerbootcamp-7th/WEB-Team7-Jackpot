import { useCallback, useRef, useState } from 'react';

import { useNavigate } from 'react-router';

import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import {
  useDeleteCoverLetter,
  useSharedLink,
  useSharedLinkToggle,
} from '@/shared/hooks/useCoverLetterQueries';
import { useUpdateQnA } from '@/shared/hooks/useQnAQueries';
import { reconstructTaggedText } from '@/shared/hooks/useReviewState/helpers';
import type { Review } from '@/shared/types/review';

interface UseCoverLetterActionsParams {
  coverLetterId: number;
  currentQna: { qnAId: number } | undefined;
  editedAnswers: Record<number, string>;
  currentReviews: Review[];
  isReviewActive: boolean;
  setIsReviewActive: (v: boolean) => void;
}

const useCoverLetterActions = ({
  coverLetterId,
  currentQna,
  editedAnswers,
  currentReviews,
  isReviewActive,
  setIsReviewActive,
}: UseCoverLetterActionsParams) => {
  const navigate = useNavigate();
  const { mutateAsync: updateQnAAsync, isPending } = useUpdateQnA();
  const { mutateAsync: deleteCoverLetterAsync, isPending: isDeleting } =
    useDeleteCoverLetter();
  const { showToast } = useToastMessageContext();

  const { data: sharedLink, isLoading } = useSharedLink(coverLetterId);
  const { mutate: toggleLink } = useSharedLinkToggle();

  const isSavingRef = useRef(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const saveCurrentAnswer = async (showSuccessToast = true) => {
    if (isPending || isSavingRef.current) return false;

    const qnAId = currentQna?.qnAId;
    const editedText = qnAId !== undefined ? editedAnswers[qnAId] : null;

    if (qnAId === undefined) {
      showToast('저장할 문항이 없습니다.', false);
      return false;
    }

    if (editedText === null || editedText === undefined) {
      return true;
    }

    isSavingRef.current = true;

    try {
      await updateQnAAsync({
        qnAId,
        answer: reconstructTaggedText(editedText, currentReviews),
      });
      if (showSuccessToast) {
        showToast('저장되었습니다.', true);
      }
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';
      showToast(`저장에 실패했습니다: ${message}`, false);
      return false;
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleSave = () => {
    void saveCurrentAnswer(true);
  };

  // 삭제 모달 열기
  const openDeleteModal = useCallback(() => {
    setDeletingId(coverLetterId);
  }, [coverLetterId]);

  // 삭제 모달 닫기
  const closeDeleteModal = useCallback(() => {
    setDeletingId(null);
  }, []);

  // 실제 삭제 실행
  const confirmDelete = useCallback(async () => {
    if (deletingId !== null) {
      try {
        await deleteCoverLetterAsync({ coverLetterId: deletingId });
        showToast('자기소개서가 삭제되었습니다.', true);
        setDeletingId(null);
        navigate('/cover-letter/list');
      } catch {
        showToast('자기소개서 삭제에 실패했습니다.', false);
        // 모달은 열린 상태 유지
      }
    }
  }, [deletingId, deleteCoverLetterAsync, showToast, navigate]);

  const handleDelete = openDeleteModal;

  const handleCopyLink = () => {
    if (isLoading) {
      showToast('링크 정보를 불러오는 중입니다.');
      return;
    }

    if (!sharedLink || !sharedLink.active) {
      showToast('공유 기능이 비활성화되어 있습니다. 먼저 설정을 켜주세요.');
      return;
    }

    const shareLinkId = sharedLink.shareLinkId;
    const baseUrl =
      window.location.origin === import.meta.env.VITE_DEV_BASE_URL
        ? import.meta.env.VITE_DEV_BASE_URL
        : import.meta.env.VITE_SERVICE_BASE_URL;

    const url = `${baseUrl || window.location.origin}/review/${shareLinkId}`;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToast('첨삭 링크가 복사되었습니다.', true);
      })
      .catch(() => {
        showToast('링크 복사에 실패했습니다. 직접 복사해주세요: ' + url);
      });
  };

  const handleToggleReview = async () => {
    const next = !isReviewActive;

    if (next) {
      const saveSucceeded = await saveCurrentAnswer(false);
      if (!saveSucceeded) {
        return;
      }
    }

    setIsReviewActive(next);
    toggleLink(
      { coverLetterId, active: next },
      {
        onError: () => {
          setIsReviewActive(!next);
          showToast('공유 설정 변경에 실패했습니다.');
        },
      },
    );
  };

  return {
    handleSave,
    handleDelete,
    handleCopyLink,
    handleToggleReview,
    isPending,
    isShareDisabled: isLoading || !sharedLink?.active,
    deletingId,
    isDeleting,
    closeDeleteModal,
    confirmDelete,
  };
};

export default useCoverLetterActions;
