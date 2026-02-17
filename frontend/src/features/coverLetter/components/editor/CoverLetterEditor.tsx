import { type ReactNode, useCallback, useEffect, useState } from 'react';

import { useSearchParams } from 'react-router';

import CoverLetterContent from '@/features/coverLetter/components/editor/CoverLetterContent';
import CoverLetterFooter from '@/features/coverLetter/components/editor/CoverLetterFooter';
import CoverLetterHeader from '@/features/coverLetter/components/editor/CoverLetterHeader';
import ReviewModalContainer from '@/features/coverLetter/components/editor/ReviewModalContainer';
import ReviewCardList from '@/features/coverLetter/components/reviewWithFriend/ReviewCardList';
import { useApproveReview } from '@/shared/hooks/useReviewQueries';
import { useDeleteReview } from '@/shared/hooks/useReviewQueries';
import type { CoverLetter as CoverLetterType } from '@/shared/types/coverLetter';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

interface MinimalQnA {
  qnAId: number;
  question: string;
  answer: string;
  modifiedAt?: string;
}

interface CoverLetterProps {
  coverLetter: CoverLetterType;
  currentQna: MinimalQnA | undefined;
  currentText: string;
  currentReviews: Review[];
  currentPageIndex: number;
  totalPages: number;
  isReviewActive: boolean;
  toolbar: ReactNode;
  onPageChange: (index: number) => void;
  onTextChange: (newText: string) => void;
}

const CoverLetterEditor = ({
  coverLetter,
  currentQna,
  currentText,
  currentReviews,
  currentPageIndex,
  totalPages,
  isReviewActive,
  toolbar,
  onPageChange,
  onTextChange,
}: CoverLetterProps) => {
  const [, setSearchParams] = useSearchParams();
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [composingLength, setComposingLength] = useState<number | null>(null);

  const { mutate: deleteReviewApi } = useDeleteReview(currentQna?.qnAId);
  const { mutate: updateReviewMutation } = useApproveReview(currentQna?.qnAId);

  const onDeleteReview = useCallback(
    (reviewId: number) => {
      if (!currentQna?.qnAId) return;
      deleteReviewApi(reviewId);
      setSelectedReviewId(null);
      setSelection(null);
    },
    [currentQna?.qnAId, deleteReviewApi],
  );

  const onToggleApproval = useCallback(
    (reviewId: number) => {
      if (!currentQna?.qnAId) return;
      updateReviewMutation(reviewId);
      setSelectedReviewId(null);
      setSelection(null);
    },
    [currentQna?.qnAId, updateReviewMutation],
  );

  const editingReview =
    selectedReviewId != null
      ? (currentReviews.find((r) => r.id === selectedReviewId) ?? null)
      : null;

  const handleReviewClick = useCallback((reviewId: number | null) => {
    setSelectedReviewId(reviewId);
  }, []);

  const handleDismiss = useCallback(() => {
    setSelection(null);
    setSelectedReviewId(null);
  }, []);

  useEffect(() => {
    const qnAId = currentQna?.qnAId;
    if (!qnAId) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (prev.get('qnAId') === String(qnAId)) return prev;
        next.set('qnAId', String(qnAId));
        return next;
      },
      { replace: true },
    );
  }, [currentQna?.qnAId, setSearchParams]);

  if (!currentQna) return null;

  return (
    <div className='flex h-full min-h-0 w-full min-w-0 flex-row pb-39.5'>
      <div className='h-full min-h-0 min-w-0 flex-1 overflow-hidden'>
        <div className='flex h-full w-full flex-col gap-2 overflow-hidden border-l border-gray-100 px-8 py-7'>
          {toolbar}

          <CoverLetterHeader
            coverLetter={coverLetter}
            totalPages={totalPages}
            modifiedAt={currentQna.modifiedAt}
          />

          <div className='flex min-h-0 flex-1 flex-col gap-3.5 overflow-hidden'>
            <div className='flex flex-shrink-0 items-start gap-3'>
              <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-50'>
                <span className='text-base font-bold text-gray-600'>
                  {currentPageIndex + 1}
                </span>
              </div>
              <div className='flex-1 text-lg font-bold text-gray-950'>
                {currentQna.question}
              </div>
            </div>

            <CoverLetterContent
              text={currentText}
              reviews={currentReviews}
              editingReview={editingReview}
              selection={selection}
              isReviewActive={isReviewActive}
              selectedReviewId={selectedReviewId}
              onSelectionChange={setSelection}
              onReviewClick={handleReviewClick}
              onTextChange={onTextChange}
              onComposingLengthChange={setComposingLength}
            />
          </div>

          <CoverLetterFooter
            charCount={composingLength ?? currentText.length}
            currentPageIndex={currentPageIndex}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />

          <ReviewModalContainer
            selection={selection}
            editingReview={editingReview}
            onDelete={onDeleteReview}
            onToggleApproval={onToggleApproval}
            onDismiss={handleDismiss}
          />
        </div>
      </div>

      {isReviewActive && (
        <aside className='h-full min-h-0 w-[248px] overflow-y-auto border-l border-gray-100'>
          <ReviewCardList
            reviews={currentReviews}
            selectedReviewId={selectedReviewId}
            onReviewClick={handleReviewClick}
          />
        </aside>
      )}
    </div>
  );
};

export default CoverLetterEditor;
