import { useCallback, useEffect, useRef, useState } from 'react';

import CoverLetterContent from '@/features/coverLetter/components/CoverLetterContent';
import CoverLetterMenu from '@/features/coverLetter/components/CoverLetterMenu';
import ReviewModal from '@/features/coverLetter/components/reviewWithFriend/ReviewModal';
import Pagination from '@/shared/components/Pagination';
import MoreVertIcon from '@/shared/icons/MoreVertIcon';
import type { CoverLetter as CoverLetterType } from '@/shared/types/coverLetter';
import type { QnA } from '@/shared/types/qna';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

const SPACER_HEIGHT = 10;

interface CoverLetterProps {
  documentId: number;
  openReview: (value: boolean) => void;
  isReviewOpen: boolean;
  selectedReviewId: string | null;
  onReviewClick: (reviewId: string | null) => void;
  reviewState: {
    coverLetter: CoverLetterType;
    qnas: QnA[];
    currentPageIndex: number;
    currentQna: QnA | undefined;
    currentText: string;
    currentReviews: Review[];
    handlePageChange: (index: number) => void;
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    coverLetter,
    qnas,
    currentPageIndex,
    currentQna,
    currentText,
    currentReviews,
    handlePageChange,
  } = reviewState;

  const editingReview = selectedReviewId
    ? (currentReviews.find((r) => r.id === selectedReviewId) ?? null)
    : null;

  // 메뉴 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // 모달 외부 클릭 처리
  const handleDocumentMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!selection) return;
      if (modalRef.current?.contains(e.target as Node)) return;
      setSelection(null);
      onReviewClick(null);
    },
    [onReviewClick, selection],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () =>
      document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [handleDocumentMouseDown]);

  if (!currentQna) return null;

  return (
    <div className='flex h-full w-[874px] flex-col gap-5 border-l border-gray-100 px-8 py-7'>
      <div className='flex flex-shrink-0 justify-between'>
        <div className='flex gap-1'>
          <div className='flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5'>
            <div className='justify-start text-xs leading-4 font-medium text-blue-600'>
              {coverLetter.companyName}
            </div>
          </div>
          <div className='flex items-center justify-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5'>
            <div className='justify-start text-xs leading-4 font-medium text-gray-600'>
              {coverLetter.jobPosition}
            </div>
          </div>
        </div>
        <div className='relative'>
          <button
            ref={buttonRef}
            type='button'
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className='cursor-pointer rounded-lg p-1'
            aria-label='더보기'
          >
            <MoreVertIcon />
          </button>

          {isMenuOpen && (
            <div ref={menuRef} className='absolute top-full right-0 z-50 mt-2'>
              <CoverLetterMenu
                documentId={documentId}
                openReview={openReview}
                isReviewOpen={isReviewOpen}
              />
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-shrink-0 flex-col gap-0.5'>
        <div className='line-clamp-1 text-xl leading-9 font-bold'>
          {coverLetter.applyYear}년 {coverLetter.applyHalf}
        </div>
        <div className='flex gap-1 text-sm text-gray-400'>
          <span>총 {qnas.length}문항</span>
          <span>·</span>
          <span>
            {new Date(currentQna.modifiedAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>

      <div className='flex min-h-0 flex-1 flex-col gap-3.5'>
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
          onTextChange={() => {
            // TODO: 텍스트 변경 API 호출
          }}
        />
      </div>

      <div className='flex h-8 flex-shrink-0 items-center justify-between gap-5 py-0.5'>
        <div className='flex gap-0.5 pl-12 text-base text-gray-400'>
          <span>{currentQna.answerSize.toLocaleString()}</span>
          <span>자</span>
        </div>

        <Pagination
          current={currentPageIndex}
          total={qnas.length}
          onChange={handlePageChange}
          ariaLabel='문항'
        />
      </div>

      {/* Modal */}
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
