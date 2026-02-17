import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (!selection) return;

    const modal = modalRef.current;
    if (!modal) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () =>
      modal.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );

    const focusable = getFocusable();
    focusable[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onDismiss();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableEls = getFocusable();
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];

      if (!first || !last) return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleKeyDown);

    return () => {
      modal.removeEventListener('keydown', handleKeyDown);

      previouslyFocused?.focus();
    };
  }, [selection, onDismiss]);

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
