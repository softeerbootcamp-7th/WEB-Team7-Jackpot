import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useReviewsByQnaId } from '@/shared/hooks/useReviewQueries';
import {
  buildReviewsFromApi,
  calculateTextChange,
  generateInternalReviewId,
  parseTaggedText,
  updateReviewRanges,
} from '@/shared/hooks/useReviewState/helpers';
import type { CoverLetter } from '@/shared/types/coverLetter';
import type { QnA } from '@/shared/types/qna';
import type { Review, ReviewBase } from '@/shared/types/review';

export const useReviewState = (coverLetter: CoverLetter, qnas: QnA[]) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const safePageIndex =
    qnas.length > 0 ? Math.min(currentPageIndex, qnas.length - 1) : 0;

  const currentQna = qnas.length > 0 ? qnas[safePageIndex] : undefined;
  const currentQnaId = currentQna?.qnAId;

  const { data: reviewData } = useReviewsByQnaId(currentQnaId);

  const [reviewsByQnaId, setReviewsByQnaId] = useState<
    Record<number, Review[]>
  >({});
  const [editedAnswers, setEditedAnswers] = useState<Record<number, string>>(
    {},
  );

  const answer = currentQna?.answer ?? '';
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
    currentQnaId !== undefined && editedAnswers[currentQnaId] !== undefined
      ? editedAnswers[currentQnaId]
      : originalText;

  const currentReviews = useMemo(() => {
    if (currentQnaId === undefined) return [];
    if (reviewsByQnaId[currentQnaId]) return reviewsByQnaId[currentQnaId];
    if (!reviewData) return [];

    return buildReviewsFromApi(
      parsed.cleaned,
      parsed.taggedRanges,
      reviewData.reviews,
    );
  }, [currentQnaId, reviewData, parsed, reviewsByQnaId]);

  const currentReviewsRef = useRef(currentReviews);
  useEffect(() => {
    currentReviewsRef.current = currentReviews;
  }, [currentReviews]);

  const getLatestReviews = useCallback(
    (prev: Record<number, Review[]>, qnaId: number): Review[] => {
      if (prev[qnaId]) return prev[qnaId];
      if (currentQnaId === qnaId) return currentReviewsRef.current;
      return [];
    },
    [currentQnaId],
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const editingReview = useMemo(
    () =>
      editingId != null
        ? (currentReviews.find((r) => r.id === editingId) ?? null)
        : null,
    [editingId, currentReviews],
  );

  const handlePageChange = useCallback((index: number) => {
    setCurrentPageIndex(index);
    setEditingId(null);
  }, []);

  const handleAddReview = useCallback(
    (review: ReviewBase) => {
      if (currentQnaId === undefined) return;
      setReviewsByQnaId((prev) => ({
        ...prev,
        [currentQnaId]: [
          ...getLatestReviews(prev, currentQnaId),
          {
            ...review,
            id: generateInternalReviewId(),
            sender: { id: 'me', nickname: '나' },
            createdAt: new Date().toISOString(),
            isValid: true,
          },
        ],
      }));
    },
    [currentQnaId, getLatestReviews],
  );

  const editedAnswersRef = useRef(editedAnswers);

  useEffect(() => {
    editedAnswersRef.current = editedAnswers;
  }, [editedAnswers]);

  const handleTextChange = useCallback(
    (newText: string) => {
      if (currentQnaId === undefined) return;

      const oldText = editedAnswers[currentQnaId] ?? originalText;
      const change = calculateTextChange(oldText, newText);

      setEditedAnswers((prev) => ({ ...prev, [currentQnaId]: newText }));
      setReviewsByQnaId((prevReviews) => {
        const baseReviews = getLatestReviews(prevReviews, currentQnaId);
        return {
          ...prevReviews,
          [currentQnaId]: updateReviewRanges(
            baseReviews,
            change.changeStart,
            change.oldLength,
            change.newLength,
            newText,
          ),
        };
      });
    },
    [currentQnaId, originalText, editedAnswers, getLatestReviews],
  );

  const handleUpdateReview = useCallback(
    (id: number, revision: string, comment: string) => {
      if (currentQnaId === undefined) return;
      setReviewsByQnaId((prev) => ({
        ...prev,
        [currentQnaId]: getLatestReviews(prev, currentQnaId).map((r) =>
          r.id === id ? { ...r, revision, comment } : r,
        ),
      }));
      setEditingId(null);
    },
    [currentQnaId, getLatestReviews],
  );

  const handleDeleteReview = useCallback(
    (id: number) => {
      if (currentQnaId === undefined) return;
      setReviewsByQnaId((prev) => ({
        ...prev,
        [currentQnaId]: getLatestReviews(prev, currentQnaId).filter(
          (r) => r.id !== id,
        ),
      }));
    },
    [currentQnaId, getLatestReviews],
  );

  const pages = useMemo(
    () =>
      qnas.map((qna) => ({
        chipData: {
          company: coverLetter?.companyName ?? '회사명 없음',
          job: coverLetter?.jobPosition ?? '직무 없음',
        },
        question: qna?.question ?? '질문이 없습니다.',
      })),
    [qnas, coverLetter?.companyName, coverLetter?.jobPosition],
  );

  const handleEditReview = useCallback((id: number) => setEditingId(id), []);
  const handleCancelEdit = useCallback(() => setEditingId(null), []);

  return {
    currentPageIndex: safePageIndex,
    currentQna,
    currentText,
    currentReviews,
    pages,
    editingReview,
    hasQnas: qnas.length > 0,
    handlePageChange,
    handleAddReview,
    handleTextChange,
    handleUpdateReview,
    handleDeleteReview,
    handleEditReview,
    handleCancelEdit,
    coverLetter,
    qnas,
    editedAnswers,
  };
};

export default useReviewState;
