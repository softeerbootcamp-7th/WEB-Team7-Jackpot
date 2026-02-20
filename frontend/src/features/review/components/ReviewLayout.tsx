import { useParams } from 'react-router';

import CoverLetterSection from '@/features/review/components/coverLetter/CoverLetterSection';
import ReviewListSection from '@/features/review/components/review/ReviewListSection';
import useCoverLetterPagination from '@/shared/hooks/useCoverLetterPagination';
import { useReviewsByQnaId } from '@/shared/hooks/useReviewQueries';
import useReviewState from '@/shared/hooks/useReviewState';
import {
  useShareCoverLetter,
  useShareQnA,
} from '@/shared/hooks/useShareQueries';
import { useSocketMessage } from '@/shared/hooks/websocket/useSocketMessage';
import { useSocketSubscribe } from '@/shared/hooks/websocket/useSocketSubscribe';
import { useStompClient } from '@/shared/hooks/websocket/useStompClient';
import type { RecentCoverLetterType } from '@/shared/types/coverLetter';
import type { WebSocketResponse } from '@/shared/types/websocket';

const ReviewLayout = () => {
  const { sharedId } = useParams();

  if (!sharedId) {
    throw new Error('유효하지 않은 공유 링크입니다.');
  }

  const { isConnected, clientRef } = useStompClient({
    shareId: sharedId,
  });

  const { data: shareData, isLoading: isShareDataLoading } =
    useShareCoverLetter(sharedId, isConnected);

  const qnAIds = shareData?.qnAIds || [];
  const coverLetter: RecentCoverLetterType | null =
    shareData?.coverLetter ?? null;

  const { safePageIndex, setCurrentPageIndex } = useCoverLetterPagination(
    qnAIds.length,
  );

  const currentQnAId = qnAIds.length > 0 ? qnAIds[safePageIndex] : undefined;

  const { data: currentQna, isLoading: isQnALoading } = useShareQnA(
    sharedId,
    currentQnAId,
    isConnected,
  );
  const { data: reviewData } = useReviewsByQnaId(currentQnAId);

  const reviewState = useReviewState({
    qna: currentQna,
    apiReviews: reviewData?.reviews,
  });

  const { handleMessage } = useSocketMessage({
    dispatchers: reviewState.dispatchers,
  });

  useSocketSubscribe({
    isConnected,
    shareId: sharedId,
    qnaId: currentQnAId?.toString(),
    clientRef,
    onMessage: (message: unknown) =>
      handleMessage(message as WebSocketResponse),
  });

  if (!isConnected) {
    return <div>웹소켓 연결 중...</div>;
  }

  if (isShareDataLoading || !shareData) {
    return <div>데이터를 불러오는 중...</div>;
  }

  if (qnAIds.length === 0) {
    return (
      <div className='p-8 text-center text-gray-500'>
        등록된 질문이 없습니다.
      </div>
    );
  }

  // !currentQna: 실제로는 위 qnAIds.length === 0 가드에서 걸리지만, TypeScript 타입 좁힘을 위해 필요
  if (isQnALoading || !currentQna) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <span className='text-gray-400'>질문을 불러오는 중...</span>
      </div>
    );
  }

  if (!coverLetter) {
    return (
      <div className='p-8 text-center text-gray-500'>
        커버레터 정보를 불러올 수 없습니다.
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
          text={reviewState.currentText}
          reviews={reviewState.currentReviews}
          currentPage={safePageIndex}
          totalPages={qnAIds.length}
          editingReview={reviewState.editingReview}
          selection={reviewState.selection}
          onSelectionChange={reviewState.setSelection}
          qnaId={currentQna.qnAId}
          onUpdateReview={reviewState.handleUpdateReview}
          onCancelEdit={reviewState.handleCancelEdit}
          onPageChange={setCurrentPageIndex}
          currentVersion={reviewState.currentVersion}
        />
      </main>
      <aside className='h-full w-[426px] flex-none'>
        <ReviewListSection
          reviews={reviewState.currentReviews}
          editingReview={reviewState.editingReview}
          qnaId={currentQna.qnAId}
          onEditReview={reviewState.handleEditReview}
        />
      </aside>
    </div>
  );
};

export default ReviewLayout;
