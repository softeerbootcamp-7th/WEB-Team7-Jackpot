import {
  useSharedLink,
  useSharedLinkToggle,
} from '@/features/coverLetter/hooks/useCoverLetterQueries';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
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
  const { mutateAsync: updateQnAAsync, isPending } = useUpdateQnA();
  const { showToast } = useToastMessageContext();

  const { data: sharedLink, isLoading } = useSharedLink(coverLetterId);
  const { mutate: toggleLink } = useSharedLinkToggle();

  const saveCurrentAnswer = async (showSuccessToast = true) => {
    if (isPending) return false;

    const qnAId = currentQna?.qnAId;
    const editedText = qnAId !== undefined ? editedAnswers[qnAId] : null;

    if (qnAId === undefined) {
      showToast('저장할 문항이 없습니다.', false);
      return false;
    }

    if (editedText === null || editedText === undefined) {
      return true;
    }

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
      showToast(`저장에 실패했습니다: ${message}`);
      return false;
    }
  };

  const handleSave = () => {
    void saveCurrentAnswer(true);
  };

  const handleDelete = () => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      showToast('삭제되었습니다.', true);
    }
  };

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
  };
};

export default useCoverLetterActions;
