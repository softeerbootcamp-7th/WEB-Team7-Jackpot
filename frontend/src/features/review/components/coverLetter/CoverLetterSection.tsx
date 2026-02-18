import { useCallback, useRef } from 'react';

import CoverLetterChipList from '@/features/review/components/coverLetter/CoverLetterChipList';
import CoverLetterContent from '@/features/review/components/coverLetter/CoverLetterContent';
import CoverLetterPagination from '@/features/review/components/coverLetter/CoverLetterPagination';
import CoverLetterQuestion from '@/features/review/components/coverLetter/CoverLetterQuestion';
import ReviewModal from '@/features/review/components/reviewModal/ReviewModal';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import useOutsideClick from '@/shared/hooks/useOutsideClick';
import {
  useCreateReview,
  useUpdateReview,
} from '@/shared/hooks/useReviewQueries';
import type { Review } from '@/shared/types/review';
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
  selection: SelectionInfo | null;
  onSelectionChange: (selection: SelectionInfo | null) => void;
  qnaId: number;
  onUpdateReview: (id: number, revision: string, comment: string) => void;
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
  selection,
  onSelectionChange,
  qnaId,
  onUpdateReview,
  onCancelEdit,
  onPageChange,
}: CoverLetterSectionProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToastMessageContext();

  const { mutate: createReview } = useCreateReview(qnaId);
  const { mutate: updateReviewMutation } = useUpdateReview(qnaId);

  const handleOutsideClick = useCallback(() => {
    onSelectionChange(null);
    if (editingReview) onCancelEdit();
  }, [editingReview, onCancelEdit, onSelectionChange]);

  useOutsideClick(modalRef, handleOutsideClick, !!selection);

  const handleSubmit = (revision: string, comment: string) => {
    if (!selection) return;

    const resetSelection = () => onSelectionChange(null);

    if (editingReview) {
      updateReviewMutation(
        {
          reviewId: editingReview.id,
          body: { suggest: revision, comment },
        },
        {
          onSuccess: () => {
            onUpdateReview(editingReview.id, revision, comment);
          },
          onError: () => {
            showToast('리뷰 업데이트에 실패했습니다. 다시 시도해주세요.');
          },
          onSettled: resetSelection,
        },
      );
    } else {
      // TODO: WebSocket REVIEW_CREATED 이벤트로 서버 데이터(실제 reviewId 포함)가 수신되면 화면에 표시됨.
      // 로컬 상태를 직접 추가하지 않고 API 호출만 수행.
      createReview(
        {
          version: 0,
          startIdx: selection.range.start,
          endIdx: selection.range.end,
          originText: selection.selectedText,
          suggest: revision,
          comment,
        },
        {
          onError: () => {
            showToast('리뷰 생성에 실패했습니다. 다시 시도해주세요.');
          },
          onSettled: resetSelection,
        },
      );
    }
  };

  const handleCancel = () => {
    onSelectionChange(null);
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
          onSelectionChange={onSelectionChange}
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
