import CoverLetterEditor from '@/features/coverLetter/components/editor/CoverLetterEditor';
import CoverLetterToolbar from '@/features/coverLetter/components/editor/CoverLetterToolbar';
import useCoverLetterActions from '@/features/coverLetter/hooks/useCoverLetterActions';
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

  const { data: reviewData } = useReviewsByQnaId(currentQna?.qnAId);

  const reviewState = useReviewState({
    qna: currentQna,
    apiReviews: reviewData?.reviews,
  });

  const {
    handleSave,
    handleDelete,
    handleCopyLink,
    handleToggleReview,
    isPending,
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
    <CoverLetterEditor
      key={safePageIndex}
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
    />
  );
};

export default CoverLetterApiMode;
