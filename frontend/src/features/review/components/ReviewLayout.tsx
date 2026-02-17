import { useParams } from 'react-router';

import CoverLetterSection from '@/features/review/components/coverLetter/CoverLetterSection';
import ReviewListSection from '@/features/review/components/review/ReviewListSection';
import useCoverLetterPage from '@/shared/hooks/useCoverLetterPage';
import { useReviewsByQnaId } from '@/shared/hooks/useReviewQueries';
import useReviewState from '@/shared/hooks/useReviewState';
import {
  useShareCoverLetter,
  useShareQnA,
} from '@/shared/hooks/useShareQueries';

const ReviewLayout = () => {
  const { sharedId } = useParams();

  if (!sharedId) {
    throw new Error('유효하지 않은 공유 링크입니다.');
  }

  // 1. ShareId로 CoverLetter 정보 + QnA ID 목록 조회 (Suspense)
  const { data: shareData } = useShareCoverLetter(sharedId);
  const { coverLetter, qnAIds } = shareData;

  // 2. 현재 페이지 인덱스 → 해당 QnA ID 결정
  const { safePageIndex, setCurrentPageIndex } = useCoverLetterPage(
    qnAIds.length,
  );
  const currentQnAId = qnAIds.length > 0 ? qnAIds[safePageIndex] : undefined;

  // 3. 현재 QnA만 단건 조회
  const { data: currentQna, isLoading: isQnALoading } = useShareQnA(
    sharedId,
    currentQnAId,
  );

  const { data: reviewData } = useReviewsByQnaId(currentQnAId);

  const {
    currentText,
    currentReviews,
    editingReview,
    selection,
    setSelection,
    handleAddReview,
    handleUpdateReview,
    handleEditReview,
    handleCancelEdit,
    handleDeleteReview,
  } = useReviewState({
    qna: currentQna,
    apiReviews: reviewData?.reviews,
  });

  const handlePageChange = (index: number) => {
    setCurrentPageIndex(index);
  };

  if (qnAIds.length === 0) {
    return (
      <div className='p-8 text-center text-gray-500'>
        등록된 질문이 없습니다.
      </div>
    );
  }

  if (isQnALoading || !currentQna) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <span className='text-gray-400'>질문을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className='flex min-h-0 flex-1 flex-row pb-30'>
      <main className='w-full'>
        <CoverLetterSection
          company={coverLetter.companyName}
          job={coverLetter.jobPosition}
          questionIndex={safePageIndex + 1}
          question={currentQna.question}
          text={currentText}
          reviews={currentReviews}
          currentPage={safePageIndex}
          totalPages={qnAIds.length}
          editingReview={editingReview}
          selection={selection}
          onSelectionChange={setSelection}
          qnaId={currentQna.qnAId}
          onAddReview={handleAddReview}
          onUpdateReview={handleUpdateReview}
          onCancelEdit={handleCancelEdit}
          onPageChange={handlePageChange}
        />
      </main>
      <aside className='h-full w-[426px] flex-none'>
        <ReviewListSection
          reviews={currentReviews}
          editingReview={editingReview}
          qnaId={currentQna.qnAId}
          onEditReview={handleEditReview}
          onDeleteReview={handleDeleteReview}
        />
      </aside>
    </div>
  );
};

export default ReviewLayout;
