import CoverLetterEditor from '@/features/coverLetter/components/editor/CoverLetterEditor';
import CoverLetterToolbar from '@/features/coverLetter/components/editor/CoverLetterToolbar';
import useCoverLetterActions from '@/features/coverLetter/hooks/useCoverLetterActions';
import ConfirmModal from '@/shared/components/modal/ConfirmModal';
import useCoverLetterPagination from '@/shared/hooks/useCoverLetterPagination';
import { useQnAList } from '@/shared/hooks/useQnAQueries';
import { useReviewsByQnaId } from '@/shared/hooks/useReviewQueries';
import useReviewState from '@/shared/hooks/useReviewState';
import type { CoverLetterType } from '@/shared/types/coverLetter';

interface CoverLetterApiModeProps {
  coverLetter: CoverLetterType;
  qnaIds: number[];
  isReviewActive: boolean;
  setIsReviewActive: (v: boolean) => void;
}

const CoverLetterApiMode = ({
  coverLetter,
  qnaIds,
  isReviewActive,
  setIsReviewActive,
}: CoverLetterApiModeProps) => {
  const { data: qnas } = useQnAList(qnaIds);

  const { safePageIndex, setCurrentPageIndex } = useCoverLetterPagination(
    qnas.length,
  );
  const currentQna = qnas.length > 0 ? qnas[safePageIndex] : undefined;

  const { data: reviewData } = useReviewsByQnaId(currentQna?.qnAId, {
    enabled: isReviewActive,
  });

  const reviewState = useReviewState({
    qna: currentQna,
    apiReviews: isReviewActive ? reviewData?.reviews : undefined,
  });

  const {
    handleSave,
    handleDelete,
    handleCopyLink,
    handleToggleReview,
    isPending,
    deletingId,
    isDeleting,
    closeDeleteModal,
    confirmDelete,
  } = useCoverLetterActions({
    coverLetterId: coverLetter.coverLetterId,
    currentQna,
    editedAnswers: reviewState.editedAnswers,
    currentReviews: reviewState.currentReviews,
    isReviewActive: isReviewActive,
    setIsReviewActive: setIsReviewActive,
  });

  if (!qnas.length) {
    return (
      <div className='flex h-full items-center justify-center text-gray-400'>
        문항이 없습니다.
      </div>
    );
  }

  const toolbar = (
    <CoverLetterToolbar
      companyName={coverLetter.companyName}
      jobPosition={coverLetter.jobPosition}
      isReviewActive={isReviewActive}
      isPending={isPending}
      onToggleReview={handleToggleReview}
      onCopyLink={handleCopyLink}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );

  return (
    <>
      <CoverLetterEditor
        coverLetter={coverLetter}
        currentQna={currentQna}
        currentText={reviewState.currentText}
        currentReviews={reviewState.currentReviews}
        currentPageIndex={safePageIndex}
        totalPages={qnas.length}
        isReviewActive={isReviewActive}
        toolbar={toolbar}
        onPageChange={setCurrentPageIndex}
        onTextChange={reviewState.handleTextChange}
        onReserveNextVersion={reviewState.reserveNextVersion}
        currentVersion={reviewState.currentVersion}
        currentReplaceAllSignal={reviewState.currentReplaceAllSignal}
        isSaving={isPending}
      />

      <ConfirmModal
        isOpen={deletingId !== null}
        isPending={isDeleting}
        type='warning'
        title='자기소개서를 삭제하시겠습니까?'
        description={
          '삭제된 자기소개서는 복구할 수 없습니다.\n정말로 삭제하시겠습니까?'
        }
        confirmText='삭제하기'
        cancelText='취소'
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </>
  );
};

export default CoverLetterApiMode;
