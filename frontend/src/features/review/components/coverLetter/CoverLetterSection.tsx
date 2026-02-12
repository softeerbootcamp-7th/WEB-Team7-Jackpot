import { useCallback, useRef, useState } from 'react';

import CoverLetterChipList from '@/features/review/components/coverLetter/CoverLetterChipList';
import CoverLetterContent from '@/features/review/components/coverLetter/CoverLetterContent';
import CoverLetterPagination from '@/features/review/components/coverLetter/CoverLetterPagination';
import CoverLetterQuestion from '@/features/review/components/coverLetter/CoverLetterQuestion';
import ReviewModal from '@/features/review/components/reviewModal/ReviewModal';
import type { Review, ReviewBase } from '@/shared//types/review';
import useOutsideClick from '@/shared/hooks/useOutsideClick';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

const SPACER_HEIGHT = 10;

interface CoverLetterSectionProps {
  company: string;
  job: string;
  questionIndex: number;
  question: string;
  text: string;
  reviews: Review[];
  currentPage: number;
  totalPages: number;
  editingReview: Review | null;
  onAddReview: (review: ReviewBase) => void;
  onUpdateReview: (id: string, revision: string, comment: string) => void;
  onCancelEdit: () => void;
  onPageChange: (index: number) => void;
}

const CoverLetterSection = ({
  company,
  job,
  questionIndex,
  question,
  text,
  reviews,
  currentPage,
  totalPages,
  editingReview,
  onAddReview,
  onUpdateReview,
  onCancelEdit,
  onPageChange,
}: CoverLetterSectionProps) => {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = useCallback(() => {
    setSelection(null);
    if (editingReview) onCancelEdit();
  }, [editingReview, onCancelEdit]);

  useOutsideClick(modalRef, handleOutsideClick, !!selection);

  const handleSubmit = (revision: string, comment: string) => {
    if (!selection) return;

    if (editingReview) {
      onUpdateReview(editingReview.id, revision, comment);
      // TODO: review 수정 API
    } else {
      onAddReview({
        selectedText: selection.selectedText,
        revision,
        comment,
        range: selection.range,
      });
      // TODO: review 추가 API
    }
    setSelection(null);
  };

  const handleCancel = () => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
    if (editingReview) onCancelEdit();
  };

  return (
    <div className='flex h-full flex-1 flex-col gap-[20px] overflow-hidden border-r border-gray-100 px-[2rem] py-[0.875rem]'>
      <CoverLetterChipList company={company} job={job} />
      <div className='flex min-h-0 flex-1 flex-col gap-[14px]'>
        <CoverLetterQuestion index={questionIndex} question={question} />
        <CoverLetterContent
          text={text}
          reviews={reviews}
          editingReview={editingReview}
          selection={selection}
          onSelectionChange={setSelection}
        />
      </div>
      <CoverLetterPagination
        current={currentPage}
        total={totalPages}
        onChange={onPageChange}
      />

      {selection && (
        <div
          ref={modalRef}
          className='fixed z-50'
          role='presentation'
          style={{
            top: selection.modalTop + SPACER_HEIGHT,
            left: selection.modalLeft,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <ReviewModal
            selectedText={selection.selectedText}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialRevision={editingReview?.revision}
            initialComment={editingReview?.comment}
          />
        </div>
      )}
    </div>
  );
};

export default CoverLetterSection;
