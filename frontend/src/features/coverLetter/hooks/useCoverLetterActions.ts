import { useEffect } from 'react';

import {
  useSharedLink,
  useSharedLinkToggle,
} from '@/features/coverLetter/hooks/useCoverLetterQueries';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { useUpdateQnA } from '@/shared/hooks/useQnAQueries';
import { reconstructTaggedText } from '@/shared/hooks/useReviewState/helpers';
import type { QnA } from '@/shared/types/qna';
import type { Review } from '@/shared/types/review';

interface UseCoverLetterActionsParams {
  documentId: number;
  currentQna: QnA | undefined;
  editedAnswers: Record<number, string>;
  currentReviews: Review[];
  isReviewOpen: boolean;
  setIsReviewOpen: (v: boolean) => void;
}

const useCoverLetterActions = ({
  documentId,
  currentQna,
  editedAnswers,
  currentReviews,
  isReviewOpen,
  setIsReviewOpen,
}: UseCoverLetterActionsParams) => {
  const { mutate: updateQnA, isPending } = useUpdateQnA();
  const { showToast } = useToastMessageContext();

  const { data: sharedLink } = useSharedLink(documentId);
  const { mutate: toggleLink } = useSharedLinkToggle();

  // 서버에서 받아온 초기 active 값으로 세팅
  useEffect(() => {
    if (sharedLink) setIsReviewOpen(sharedLink.active);
  }, [sharedLink, setIsReviewOpen]);

  const handleSave = () => {
    if (!currentQna?.qnAId) {
      showToast('저장할 문항이 없습니다.');
      return;
    }

    const qnAId = currentQna.qnAId;

    if (!(qnAId in editedAnswers)) {
      showToast('변경된 내용이 없습니다.');
      return;
    }

    const editedText = editedAnswers[qnAId];
    const taggedAnswer = reconstructTaggedText(editedText, currentReviews);

    updateQnA(
      { qnAId, answer: taggedAnswer },
      {
        onSuccess: () => {
          showToast('저장되었습니다.', true);
        },
        onError: (error) => {
          showToast(`저장에 실패했습니다: ${error.message}`);
        },
      },
    );
  };

  const handleDelete = () => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      // TODO: 삭제 API 호출
      showToast('삭제되었습니다.', true);
    }
  };

  const handleCopyLink = () => {
    const shareLinkId = sharedLink?.shareLinkId;
    const url = `${import.meta.env.VITE_SERVICE_BASE_URL || window.location.origin}/review/${shareLinkId ?? documentId}`;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToast('첨삭 링크가 복사되었습니다.', true);
      })
      .catch(() => {
        showToast('링크 복사에 실패했습니다. 직접 복사해주세요: ' + url);
      });
  };

  const handleToggleReview = () => {
    const next = !isReviewOpen;
    console.log(next);
    setIsReviewOpen(next);
    toggleLink({ coverLetterId: documentId, active: next });
  };

  return {
    handleSave,
    handleDelete,
    handleCopyLink,
    handleToggleReview,
    isPending,
  };
};

export default useCoverLetterActions;
