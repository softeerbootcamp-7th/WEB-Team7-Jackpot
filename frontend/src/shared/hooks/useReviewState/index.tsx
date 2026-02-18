import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ApiReview } from '@/shared/api/reviewApi';
import {
  buildReviewsFromApi,
  calculateTextChange,
  parseTaggedText,
  updateReviewRanges,
  updateSelectionForTextChange,
} from '@/shared/hooks/useReviewState/helpers';
import type { MinimalQnA } from '@/shared/types/qna';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

interface UseReviewStateParams {
  qna: MinimalQnA | undefined;
  apiReviews: ApiReview[] | undefined;
}

/**
 * TODO: WebSocket 통합 시 상태 반영 정책
 *
 * 즉시 반영 (낙관적 업데이트):
 *   - Writer 텍스트 수정: handleTextChange로 로컬 즉시 반영, WebSocket으로 상대방에게 발송
 *   - 리뷰 수정: handleUpdateReview로 수정자 로컬 즉시 반영, 상대방은 WebSocket 수신
 *
 * WebSocket 이벤트 수신으로만 반영 (낙관적 업데이트 X):
 *   - 리뷰 생성: API 호출 → REVIEW_CREATED 이벤트 수신 시 반영
 *   - 리뷰 삭제: API 호출 → REVIEW_DELETED 이벤트 수신 시 반영
 *   - 리뷰 적용(approve): API 호출 → WebSocket 이벤트 수신 시 반영
 */
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
      editingId !== null
        ? (currentReviews.find((r) => r.id === editingId) ?? null)
        : null,
    [editingId, currentReviews],
  );

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

  const handleEditReview = useCallback((id: number) => setEditingId(id), []);
  const handleCancelEdit = useCallback(() => setEditingId(null), []);

  return {
    currentText,
    currentReviews,
    editingReview,
    selection,
    setSelection,
    handleTextChange,
    handleUpdateReview,
    handleEditReview,
    handleCancelEdit,
    editedAnswers,
  };
};

export default useReviewState;
