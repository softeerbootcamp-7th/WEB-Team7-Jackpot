import CoverLetterChipList from '@/features/review/components/coverLetter/CoverLetterChipList';
import CoverLetterContent from '@/features/review/components/coverLetter/CoverLetterContent';
import CoverLetterPagination from '@/features/review/components/coverLetter/CoverLetterPagination';
import CoverLetterQuestion from '@/features/review/components/coverLetter/CoverLetterQuestion';
import ReviewModalContainer from '@/features/review/components/coverLetter/ReviewModalContainer';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import {
  useCreateReview,
  useUpdateReview,
} from '@/shared/hooks/useReviewQueries';
import { mapCleanRangeToTaggedRange } from '@/shared/hooks/useReviewState/helpers';
import { isRangeOverlapping } from '@/shared/hooks/useTextSelection/helpers';
import type { Review } from '@/shared/types/review';
import type { SelectionInfo } from '@/shared/types/selectionInfo';

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
  onUpdateReview: (id: number, suggest: string, comment: string) => void;
  onCancelEdit: () => void;
  onPageChange: (index: number) => void;
  currentVersion: number;
  onReserveNextVersion?: () => number;
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
  currentVersion,
  onReserveNextVersion,
}: CoverLetterSectionProps) => {
  const { showToast } = useToastMessageContext();

  const { mutate: createReview } = useCreateReview(qnaId);
  const { mutate: updateReviewMutation } = useUpdateReview(qnaId);

  const handleSubmit = (suggest: string, comment: string) => {
    if (!selection) return;

    const resetSelection = () => onSelectionChange(null);

    if (editingReview) {
      updateReviewMutation(
        {
          reviewId: editingReview.id,
          body: { suggest, comment },
        },
        {
          onSuccess: () => onUpdateReview(editingReview.id, suggest, comment),
          onError: () =>
            showToast('리뷰 업데이트에 실패했습니다. 다시 시도해주세요.'),
          onSettled: resetSelection,
        },
      );
    } else {
      const overlapsExistingReview = isRangeOverlapping(
        selection.range.start,
        selection.range.end,
        reviews,
      );

      if (overlapsExistingReview) {
        showToast('이미 리뷰가 있는 구간에는 새 리뷰를 달 수 없습니다.');
        resetSelection();
        return;
      }

      const reservedVersion = onReserveNextVersion
        ? onReserveNextVersion()
        : currentVersion + 1;

      const taggedRange = mapCleanRangeToTaggedRange(
        text,
        reviews,
        selection.range,
      );

      createReview(
        {
          version: Math.max(0, reservedVersion - 1),
          startIdx: taggedRange.startIdx,
          endIdx: taggedRange.endIdx,
          originText: selection.selectedText,
          suggest,
          comment,
        },
        {
          onError: (error: unknown) => {
            const isConflict =
              error instanceof Error && error.message.includes('409');
            showToast(
              isConflict
                ? '이미 수정된 원문이에요. 다시 선택해 주세요.'
                : '리뷰 생성에 실패했습니다. 다시 시도해주세요.',
            );
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
        <ReviewModalContainer
          selection={selection}
          editingReview={editingReview}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default CoverLetterSection;
