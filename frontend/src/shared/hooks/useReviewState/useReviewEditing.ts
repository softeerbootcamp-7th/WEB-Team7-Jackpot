import { useCallback, useMemo, useState } from 'react';

import type { Review } from '@/shared/types/review';

interface UseReviewEditingParams {
  qnaId: number | undefined;
  currentReviews: Review[];
  getLatestReviews: (prev: Record<number, Review[]>, id: number) => Review[];
  setReviewsByQnaId: React.Dispatch<
    React.SetStateAction<Record<number, Review[]>>
  >;
}

/**
 * 리뷰 편집 상태(수정 중인 리뷰 ID, 편집/취소/저장 핸들러)를 관리하는 훅.
 * handleReviewDeletedEvent에서 editingId를 리셋할 수 있도록 setEditingId도 반환한다.
 */
export const useReviewEditing = ({
  qnaId,
  currentReviews,
  getLatestReviews,
  setReviewsByQnaId,
}: UseReviewEditingParams) => {
  const [editingId, setEditingId] = useState<number | null>(null);

  const editingReview = useMemo(
    () =>
      editingId !== null
        ? (currentReviews.find((r) => r.id === editingId) ?? null)
        : null,
    [editingId, currentReviews],
  );

  const handleEditReview = useCallback((id: number) => setEditingId(id), []);
  const handleCancelEdit = useCallback(() => setEditingId(null), []);

  const handleUpdateReview = useCallback(
    (id: number, suggest: string, comment: string) => {
      if (qnaId === undefined) return;
      setReviewsByQnaId((prev) => ({
        ...prev,
        [qnaId]: getLatestReviews(prev, qnaId).map((r) =>
          r.id === id ? { ...r, suggest, comment } : r,
        ),
      }));
      setEditingId(null);
    },
    [qnaId, getLatestReviews, setReviewsByQnaId],
  );

  return {
    editingReview,
    handleEditReview,
    handleCancelEdit,
    handleUpdateReview,
    setEditingId,
  };
};
