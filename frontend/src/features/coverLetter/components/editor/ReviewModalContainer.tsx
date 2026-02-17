import { useRef } from 'react';

import ReviewModal from '@/features/coverLetter/components/reviewWithFriend/ReviewModal';
import useOutsideClick from '@/shared/hooks/useOutsideClick';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

const SPACER_HEIGHT = 10;

interface ReviewModalContainerProps {
  selection: SelectionInfo | null;
  editingReview: Review | null;
  onDelete: (reviewId: number) => void;
  onToggleApproval: (reviewId: number) => void;
  onDismiss: () => void;
}

const ReviewModalContainer = ({
  selection,
  editingReview,
  onDelete,
  onToggleApproval,
  onDismiss,
}: ReviewModalContainerProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useOutsideClick(modalRef, onDismiss, !!selection);

  if (!selection) return null;

  return (
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
        onDelete={onDelete}
        onToggleApproval={onToggleApproval}
      />
    </div>
  );
};

export default ReviewModalContainer;
