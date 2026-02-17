import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ApiReview } from '@/shared/api/reviewApi';
import {
  applyViewStatus,
  buildReviewsFromApi,
  calculateTextChange,
  generateInternalReviewId,
  parseTaggedText,
  updateReviewRanges,
  updateSelectionForTextChange,
} from '@/shared/hooks/useReviewState/helpers';
import type { Review, ReviewBase } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

interface MinimalQnA {
  qnAId: number;
  answer: string;
}

interface UseReviewStateParams {
  qna: MinimalQnA | undefined;
  apiReviews: ApiReview[] | undefined;
}

export const useReviewState = ({ qna, apiReviews }: UseReviewStateParams) => {
  const qnaId = qna?.qnAId;

  const [reviewsByQnaId, setReviewsByQnaId] = useState<
    Record<number, Review[]>
  >({});
  const [editedAnswers, setEditedAnswers] = useState<Record<number, string>>(
    {},
  );

  const answer = qna?.answer ?? '';
  const parsed = useMemo(
    () =>
      answer
        ? parseTaggedText(answer)
        : {
            cleaned: '',
            taggedRanges: [] as Array<{
              id: number;
              start: number;
              end: number;
            }>,
          },
    [answer],
  );
  const originalText = parsed.cleaned;

  const currentText =
    qnaId !== undefined && editedAnswers[qnaId] !== undefined
      ? editedAnswers[qnaId]
      : originalText;

  const currentReviews = useMemo(() => {
    if (qnaId === undefined) return [];
    if (reviewsByQnaId[qnaId]) return reviewsByQnaId[qnaId];
    if (!apiReviews) return [];

    return buildReviewsFromApi(parsed.cleaned, parsed.taggedRanges, apiReviews);
  }, [qnaId, apiReviews, parsed, reviewsByQnaId]);

  const currentReviewsRef = useRef(currentReviews);
  useEffect(() => {
    currentReviewsRef.current = currentReviews;
  }, [currentReviews]);

  const getLatestReviews = useCallback(
    (prev: Record<number, Review[]>, id: number): Review[] => {
      if (prev[id]) return prev[id];
      if (qnaId === id) return currentReviewsRef.current;
      return [];
    },
    [qnaId],
  );

  const [selection, setSelection] = useState<SelectionInfo | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const editingReview = useMemo(
    () =>
      editingId != null
        ? (currentReviews.find((r) => r.id === editingId) ?? null)
        : null,
    [editingId, currentReviews],
  );

  const handleAddReview = useCallback(
    (review: ReviewBase) => {
      if (qnaId === undefined) return;
      setReviewsByQnaId((prev) => ({
        ...prev,
        [qnaId]: [
          ...getLatestReviews(prev, qnaId),
          {
            ...review,
            id: generateInternalReviewId(),
            sender: { id: 'me', nickname: '나' },
            createdAt: new Date().toISOString(),
            isValid: true,
            isApproved: false,
            viewStatus: 'PENDING' as const,
          },
        ],
      }));
    },
    [qnaId, getLatestReviews],
  );

  const editedAnswersRef = useRef(editedAnswers);

  useEffect(() => {
    editedAnswersRef.current = editedAnswers;
  }, [editedAnswers]);

  const handleTextChange = useCallback(
    (newText: string) => {
      if (qnaId === undefined) return;

      const oldText = editedAnswers[qnaId] ?? originalText;
      const change = calculateTextChange(oldText, newText);

      setEditedAnswers((prev) => ({ ...prev, [qnaId]: newText }));
      setReviewsByQnaId((prevReviews) => {
        const baseReviews = getLatestReviews(prevReviews, qnaId);
        return {
          ...prevReviews,
          [qnaId]: updateReviewRanges(
            baseReviews,
            change.changeStart,
            change.oldLength,
            change.newLength,
            newText,
          ),
        };
      });

      // 텍스트 변경에 따라 selection 범위도 함께 조정
      // TODO: websocket 연결 시 서버에서 전달하는 OT operation 기반으로 교체 가능
      setSelection((prev) => {
        if (!prev) return null;
        return updateSelectionForTextChange(
          prev,
          change.changeStart,
          change.oldLength,
          change.newLength,
          newText,
        );
      });
    },
    [qnaId, originalText, editedAnswers, getLatestReviews],
  );

  const handleUpdateReview = useCallback(
    (id: number, revision: string, comment: string) => {
      if (qnaId === undefined) return;
      setReviewsByQnaId((prev) => ({
        ...prev,
        [qnaId]: getLatestReviews(prev, qnaId).map((r) =>
          r.id === id ? { ...r, revision, comment } : r,
        ),
      }));
      setEditingId(null);
    },
    [qnaId, getLatestReviews],
  );

  const handleDeleteReview = useCallback(
    (id: number) => {
      if (qnaId === undefined) return;
      setReviewsByQnaId((prev) => ({
        ...prev,
        [qnaId]: getLatestReviews(prev, qnaId).filter((r) => r.id !== id),
      }));
    },
    [qnaId, getLatestReviews],
  );

  // TODO: websocket 연결 시 approve 결과를 websocket 이벤트로 수신하여 반영
  const handleApproveReview = useCallback(
    (id: number) => {
      if (qnaId === undefined) return;
      setReviewsByQnaId((prev) => {
        const reviews = getLatestReviews(prev, qnaId).map((r) =>
          r.id === id ? { ...r, isApproved: true } : r,
        );
        return {
          ...prev,
          [qnaId]: applyViewStatus(reviews, currentText),
        };
      });
    },
    [qnaId, getLatestReviews, currentText],
  );

  const handleEditReview = useCallback((id: number) => setEditingId(id), []);
  const handleCancelEdit = useCallback(() => setEditingId(null), []);

  // TODO: websocket 연결 시 서버에서 확정 데이터를 수신하면 로컬 오버라이드를 제거하고 서버 데이터로 전환
  const clearLocalReviews = useCallback((id: number) => {
    setReviewsByQnaId((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  return {
    currentText,
    currentReviews,
    editingReview,
    selection,
    setSelection,
    handleAddReview,
    handleTextChange,
    handleUpdateReview,
    handleDeleteReview,
    handleApproveReview,
    handleEditReview,
    handleCancelEdit,
    clearLocalReviews,
    editedAnswers,
  };
};

export default useReviewState;
