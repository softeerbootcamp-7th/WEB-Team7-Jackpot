import CoverLetterEditor from '@/features/coverLetter/components/editor/CoverLetterEditor';
import CoverLetterToolbar from '@/features/coverLetter/components/editor/CoverLetterToolbar';
import useCoverLetterActions from '@/features/coverLetter/hooks/useCoverLetterActions';
import useCoverLetterPagination from '@/shared/hooks/useCoverLetterPagination';
import { useReviewsByQnaId } from '@/shared/hooks/useReviewQueries';
import useReviewState from '@/shared/hooks/useReviewState';
import { useShareQnA } from '@/shared/hooks/useShareQueries';
import { useSocketMessage } from '@/shared/hooks/websocket/useSocketMessage';
import { useSocketSubscribe } from '@/shared/hooks/websocket/useSocketSubscribe';
import { useStompClient } from '@/shared/hooks/websocket/useStompClient';
import type { CoverLetterType } from '@/shared/types/coverLetter';
import type { WebSocketResponse } from '@/shared/types/websocket';

interface CoverLetterLiveModeProps {
  shareId: string;
  coverLetter: CoverLetterType;
  qnaIds: number[];
  isReviewActive: boolean;
  setIsReviewActive: (v: boolean) => void;
}

const CoverLetterLiveMode = ({
  shareId,
  coverLetter,
  qnaIds,
  isReviewActive,
  setIsReviewActive,
}: CoverLetterLiveModeProps) => {
  const { safePageIndex, setCurrentPageIndex } = useCoverLetterPagination(
    qnaIds.length,
  );
  const currentQnAId = qnaIds.length > 0 ? qnaIds[safePageIndex] : undefined;

  const { isConnected, sendMessage, clientRef } = useStompClient({
    shareId: shareId,
  });
  const { data: currentQna, isLoading: isQnALoading } = useShareQnA(
    shareId,
    currentQnAId,
    isConnected,
  );

  const { data: reviewData } = useReviewsByQnaId(currentQnAId, {
    enabled: isConnected,
  });

  const reviewState = useReviewState({
    qna: currentQna,
    apiReviews: reviewData?.reviews,
  });

  const { handleMessage } = useSocketMessage({
    dispatchers: reviewState.dispatchers,
  });

  useSocketSubscribe({
    isConnected,
    shareId: shareId,
    qnaId: currentQnAId?.toString(),
    onMessage: (message: unknown) =>
      handleMessage(message as WebSocketResponse),
    clientRef,
  });

  const { handleDelete, handleCopyLink, handleToggleReview } =
    useCoverLetterActions({
      coverLetterId: coverLetter.coverLetterId,
      currentQna,
      editedAnswers: reviewState.editedAnswers,
      currentReviews: reviewState.currentReviews,
      isReviewActive: isReviewActive,
      setIsReviewActive: setIsReviewActive,
    });

  // TODO: WebSocket 구독 관리
  // - 마운트 시: /sub/share/{shareId}/qna/{currentQnAId}/review 구독
  // - currentQnAId 변경 시: 기존 구독 해제 → 새 구독
  // - 텍스트 변경 시: /pub/share/{shareId}/qna/{currentQnAId}/text-update 발송
  // - 언마운트 시: 구독 해제

  if (qnaIds.length === 0) {
    return (
      <div className='flex h-full items-center justify-center text-gray-400'>
        문항이 없습니다.
      </div>
    );
  }

  if (isQnALoading || !currentQna) {
    return (
      <div className='flex h-full min-h-0 w-full min-w-0 items-center justify-center'>
        <span className='text-gray-400'>질문을 불러오는 중...</span>
      </div>
    );
  }

  const toolbar = (
    <CoverLetterToolbar
      companyName={coverLetter.companyName}
      jobPosition={coverLetter.jobPosition}
      isReviewActive={isReviewActive}
      onToggleReview={handleToggleReview}
      onCopyLink={handleCopyLink}
      onDelete={handleDelete}
      autoSave
    />
  );

  return (
    <CoverLetterEditor
      coverLetter={coverLetter}
      currentQna={currentQna}
      currentText={reviewState.currentText}
      currentReviews={reviewState.currentReviews}
      currentPageIndex={safePageIndex}
      totalPages={qnaIds.length}
      isReviewActive={isReviewActive}
      toolbar={toolbar}
      onPageChange={setCurrentPageIndex}
      onTextChange={reviewState.handleTextChange}
      onReserveNextVersion={reviewState.reserveNextVersion}
      currentVersion={reviewState.currentVersion}
      currentReplaceAllSignal={reviewState.currentReplaceAllSignal}
      isConnected={isConnected}
      sendMessage={sendMessage}
      shareId={shareId}
    />
  );
};

export default CoverLetterLiveMode;
