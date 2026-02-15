import { useCallback, useEffect, useRef, useState } from 'react';

import { useSearchParams } from 'react-router';

import CoverLetterContent from '@/features/coverLetter/components/CoverLetterContent';
import CoverLetterToolbar from '@/features/coverLetter/components/CoverLetterToolbar';
import ReviewModal from '@/features/coverLetter/components/reviewWithFriend/ReviewModal';
import useCoverLetterActions from '@/features/coverLetter/hooks/useCoverLetterActions';
import Pagination from '@/shared/components/Pagination';
import useOutsideClick from '@/shared/hooks/useOutsideClick';
import type { CoverLetter as CoverLetterType } from '@/shared/types/coverLetter';
import type { QnA } from '@/shared/types/qna';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';
import { mapApplyHalf } from '@/shared/utils/recruitSeason';

const SPACER_HEIGHT = 10;

interface CoverLetterProps {
  documentId: number;
  openReview: (value: boolean) => void;
  isReviewOpen: boolean;
  selectedReviewId: number | null;
  onReviewClick: (reviewId: number | null) => void;
  reviewState: {
    coverLetter: CoverLetterType;
    qnas: QnA[];
    currentPageIndex: number;
    currentQna: QnA | undefined;
    currentText: string;
    currentReviews: Review[];
    handlePageChange: (index: number) => void;
    handleTextChange: (newText: string) => void;
    editedAnswers: Record<number, string>;
  };
}

const CoverLetter = ({
  documentId,
  openReview,
  isReviewOpen,
  selectedReviewId,
  onReviewClick,
  reviewState,
}: CoverLetterProps) => {
  const [, setSearchParams] = useSearchParams();
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    coverLetter,
    qnas,
    currentPageIndex,
    currentQna,
    currentText,
    currentReviews,
    handlePageChange,
    handleTextChange,
    editedAnswers,
  } = reviewState;

  const {
    handleSave,
    handleDelete,
    handleCopyLink,
    handleToggleReview,
    isPending,
  } = useCoverLetterActions({
    documentId,
    currentQna,
    editedAnswers,
    currentReviews,
    isReviewOpen,
    setIsReviewOpen: openReview,
  });

  const editingReview =
    selectedReviewId != null
      ? (currentReviews.find((r) => r.id === selectedReviewId) ?? null)
      : null;

  const handleOutsideClick = useCallback(() => {
    setSelection(null);
    onReviewClick(null);
  }, [onReviewClick]);

  useOutsideClick(modalRef, handleOutsideClick, !!selection);

  useEffect(() => {
    const qnAId = qnas[currentPageIndex]?.qnAId;
    if (!qnAId) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('qnAId', String(qnAId));
        return next;
      },
      { replace: true },
    );
  }, [currentPageIndex, qnas, setSearchParams]);

  if (!currentQna) return null;

  return (
    <div className='flex h-full w-full flex-col gap-2 overflow-hidden border-l border-gray-100 px-8 py-7'>
      <CoverLetterToolbar
        companyName={coverLetter.companyName}
        jobPosition={coverLetter.jobPosition}
        isReviewOpen={isReviewOpen}
        isPending={isPending}
        onToggleReview={handleToggleReview}
        onCopyLink={handleCopyLink}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <div className='flex flex-shrink-0 flex-col gap-0.5 pb-2 pl-2'>
        <div className='line-clamp-1 text-xl leading-9 font-bold'>
          {coverLetter.applyYear}년 {mapApplyHalf(coverLetter.applyHalf)}
        </div>
        <div className='flex gap-1 text-sm text-gray-400'>
          <span>총 {qnas.length}문항</span>
          <span>·</span>
          <span>
            {new Date(coverLetter.deadline).toLocaleDateString('ko-KR')}
          </span>
          <span>·</span>
          <span>
            최종수정{' '}
            {new Date(currentQna.modifiedAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>

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
          isReviewOpen={isReviewOpen}
          selectedReviewId={selectedReviewId}
          onSelectionChange={setSelection}
          onReviewClick={onReviewClick}
          onTextChange={handleTextChange}
        />
      </div>

      <div className='flex h-8 flex-shrink-0 items-center justify-between gap-5 py-0.5'>
        <div className='flex gap-0.5 pl-12 text-base text-gray-400'>
          <span>{currentText.length.toLocaleString()}</span>
          <span>자</span>
        </div>

        <Pagination
          current={currentPageIndex}
          total={qnas.length}
          onChange={handlePageChange}
          ariaLabel='문항'
        />
      </div>

      {selection && (
        <div
          ref={modalRef}
          className='fixed z-[9999]'
          role='dialog'
          aria-modal='true'
          style={{
            top: selection.modalTop + SPACER_HEIGHT,
            left: selection.modalLeft,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <ReviewModal
            review={editingReview}
            initialRevision={editingReview?.revision}
            initialComment={editingReview?.comment}
          />
        </div>
      )}
    </div>
  );
};

export default CoverLetter;
