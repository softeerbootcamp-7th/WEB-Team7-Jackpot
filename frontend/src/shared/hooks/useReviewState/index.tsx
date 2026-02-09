import { useCallback, useState } from 'react';

import {
  buildReviewsFromApi,
  generateInternalReviewId,
  mockCoverLetterApi,
  mockFetchCoverLetterById,
  mockFetchReviewsByQnaId,
  parseTaggedText,
} from '@/shared/hooks/useReviewState/helpers';
import type { CoverLetter } from '@/shared/types/coverLetter';
import type { QnA } from '@/shared/types/qna';
import type { Review, ReviewBase } from '@/shared/types/review';

export const useReviewState = (coverLetterId: number = 1) => {
  const fetched = mockFetchCoverLetterById(coverLetterId);
  const initialCoverLetter: CoverLetter =
    fetched.coverLetter ?? mockCoverLetterApi.coverLetter;
  const [coverLetter] = useState<CoverLetter>(initialCoverLetter);
  const [qnas] = useState<QnA[]>(fetched.qnas || []);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const currentQna = qnas[currentPageIndex];

  const [currentReviews, setCurrentReviews] = useState<Review[]>(() => {
    if (!currentQna) return [];
    const { cleaned, taggedRanges } = parseTaggedText(currentQna.answer);
    const apiReviews = mockFetchReviewsByQnaId(currentQna.qnaId).reviews;
    return buildReviewsFromApi(cleaned, taggedRanges, apiReviews);
  });

  const currentText = currentQna
    ? parseTaggedText(currentQna.answer).cleaned
    : '';

  const [editingId, setEditingId] = useState<string | null>(null);
  const editingReview =
    editingId != null
      ? (currentReviews.find((r) => r.id === editingId) ?? null)
      : null;

  const handlePageChange = useCallback(
    (index: number) => {
      setCurrentPageIndex(index);
      const nextQna = qnas[index];
      if (nextQna) {
        const { cleaned, taggedRanges } = parseTaggedText(nextQna.answer);
        const apiReviews = mockFetchReviewsByQnaId(nextQna.qnaId).reviews;
        setCurrentReviews(
          buildReviewsFromApi(cleaned, taggedRanges, apiReviews),
        );
      }
      setEditingId(null);
    },
    [qnas],
  );

  const handleAddReview = useCallback((review: ReviewBase) => {
    // TODO: 서버와 연동하는 로직 추가 예정
    setCurrentReviews((prev) => [
      ...prev,
      {
        ...review,
        id: generateInternalReviewId(),
        sender: { id: 'me', nickname: '나' },
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleUpdateReview = useCallback(
    (reviewId: string, revision: string, comment: string) => {
      // TODO: 서버와 연동하는 로직 추가 예정
      setCurrentReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, revision, comment } : r)),
      );
      setEditingId(null);
    },
    [],
  );

  const handleEditReview = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleDeleteReview = useCallback((id: string) => {
    // TODO: 서버와 연동하는 로직 추가 예정
    setCurrentReviews((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const hasActiveEdit = editingId !== null;

  const pages = qnas.map((qna) => ({
    chipData: {
      company: coverLetter.companyName,
      job: coverLetter.jobPosition,
    },
    question: qna.question,
  }));

  return {
    coverLetter,
    qnas,
    pages,
    currentPageIndex,
    currentQna,
    currentText,

    currentReviews,
    editingId,
    editingReview,
    hasActiveEdit,

    handlePageChange,
    handleAddReview,
    handleUpdateReview,
    handleDeleteReview,
    handleEditReview,
    handleCancelEdit,
  };
};

export default useReviewState;
