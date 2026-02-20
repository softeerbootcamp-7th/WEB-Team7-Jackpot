import { useRef } from 'react';

import ReviewModal from '@/features/review/components/reviewModal/ReviewModal';
import useModalKeyboardNavigation from '@/shared/hooks/useModalKeyboardNavigation';
import useOutsideClick from '@/shared/hooks/useOutsideClick';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

const SPACER_HEIGHT = 10;

interface ReviewModalContainerProps {
  selection: SelectionInfo;
  editingReview: Review | null;
  onSubmit: (suggest: string, comment: string) => void;
  onCancel: () => void;
}

const ReviewModalContainer = ({
  selection,
  editingReview,
  onSubmit,
  onCancel,
}: ReviewModalContainerProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useModalKeyboardNavigation(modalRef, onCancel, !!selection);

  useOutsideClick(modalRef, onCancel, !!selection);

  return (
    <div
      ref={modalRef}
      className='fixed z-50'
      role='presentation'
      style={{
        top: selection.modalTop + SPACER_HEIGHT,
        left: selection.modalLeft,
      }}
    >
      <ReviewModal
        selectedText={selection.selectedText}
        onSubmit={onSubmit}
        onCancel={onCancel}
        initialSuggest={editingReview?.suggest ?? ''}
        initialComment={editingReview?.comment}
      />
    </div>
  );
};

export default ReviewModalContainer;
