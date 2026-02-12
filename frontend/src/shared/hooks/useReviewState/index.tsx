import { useCallback, useMemo, useState } from 'react';

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
  // 페이지 인덱스 상태
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const safePageIndex =
    qnas.length > 0 ? Math.min(currentPageIndex, qnas.length - 1) : 0;

  const currentQna = qnas.length > 0 ? qnas[safePageIndex] : undefined;
  const currentQnaId = currentQna?.qnAId;

  // 데이터 페칭
  const { data: reviewData } = useReviewsByQnaId(currentQnaId);

  // 로컬 편집 상태 (Map 구조)
  const [reviewsByQnaId, setReviewsByQnaId] = useState<
    Record<number, Review[]>
  >({});
  const [editedAnswers, setEditedAnswers] = useState<Record<number, string>>(
    {},
  );

  // 텍스트 데이터 파생
  const answer = currentQna?.answer ?? '';
  const parsed = useMemo(
    () =>
      answer ? parseTaggedText(answer) : { cleaned: '', taggedRanges: [] },
    [answer],
  );
  const originalText = parsed.cleaned;

  const currentText =
    currentQnaId !== undefined && editedAnswers[currentQnaId] !== undefined
      ? editedAnswers[currentQnaId]
      : originalText;

  // 리뷰 데이터 통합 (파생된 상태)
  const currentReviews = useMemo(() => {
    if (currentQnaId === undefined) return [];
    if (reviewsByQnaId[currentQnaId]) return reviewsByQnaId[currentQnaId];
    if (!reviewData) return [];

    const serverParsed = parseTaggedText(currentQna?.answer ?? '');
    return buildReviewsFromApi(
      serverParsed.cleaned,
      serverParsed.taggedRanges,
      reviewData.reviews,
    );
  }, [currentQnaId, reviewData, currentQna?.answer, reviewsByQnaId]);

  // 편집 중인 리뷰 상태
  const [editingId, setEditingId] = useState<string | null>(null);
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
          ...(prev[currentQnaId] ?? currentReviews),
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
    [currentQnaId, currentReviews],
  );

  const handleTextChange = useCallback(
    (newText: string) => {
      if (currentQnaId === undefined) return;

      const oldText = editedAnswers[currentQnaId] ?? originalText;
      const change = calculateTextChange(oldText, newText);

      setEditedAnswers((prev) => ({ ...prev, [currentQnaId]: newText }));
      setReviewsByQnaId((prevReviews) => ({
        ...prevReviews,
        [currentQnaId]: updateReviewRanges(
          prevReviews[currentQnaId] ?? currentReviews,
          change.changeStart,
          change.oldLength,
          change.newLength,
        ),
      }));
    },
    [currentQnaId, originalText, editedAnswers, currentReviews],
  );

  const handleUpdateReview = useCallback(
    (id: string, revision: string, comment: string) => {
      if (currentQnaId === undefined) return;
      setReviewsByQnaId((prev) => ({
        ...prev,
        [currentQnaId]: (prev[currentQnaId] ?? currentReviews).map((r) =>
          r.id === id ? { ...r, revision, comment } : r,
        ),
      }));
      setEditingId(null);
    },
    [currentQnaId, currentReviews],
  );

  const handleDeleteReview = useCallback(
    (id: string) => {
      if (currentQnaId === undefined) return;
      setReviewsByQnaId((prev) => ({
        ...prev,
        [currentQnaId]: (prev[currentQnaId] ?? currentReviews).filter(
          (r) => r.id !== id,
        ),
      }));
    },
    [currentQnaId, currentReviews],
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
    [qnas, coverLetter],
  );

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
    handleEditReview: useCallback((id: string) => setEditingId(id), []),
    handleCancelEdit: useCallback(() => setEditingId(null), []),
    coverLetter,
    qnas,
    editedAnswers,
  };
};

export default useReviewState;
