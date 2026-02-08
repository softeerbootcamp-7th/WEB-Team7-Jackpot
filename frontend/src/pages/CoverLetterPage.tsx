import { useCallback, useState } from 'react';

import CoverLetter from '@/features/coverLetter/components/CoverLetter';
import CoverLetterWriteSidebar from '@/features/coverLetter/components/CoverLetterWriteSidebar';
import NewCoverLetter from '@/features/coverLetter/components/newCoverLetter/NewCoverLetter';
import ReviewCardList from '@/features/coverLetter/components/reviewWithFriend/ReviewCardList';
import ReviewSidebar from '@/features/coverLetter/components/reviewWithFriend/ReviewSidebar';
import {
  coverLetterContent,
  coverLetterHeaderText,
  emptyCaseText,
} from '@/features/coverLetter/constants';
import useCoverLetterParams from '@/features/coverLetter/hooks/useCoverLetterParams';
import ContentHeader from '@/shared/components/ContentHeader';
import DataGuard from '@/shared/components/DataGuard';
import EmptyCase from '@/shared/components/EmptyCase';
import SidebarLayout from '@/shared/components/SidebarLayout';
import TabBar from '@/shared/components/TabBar';
import useReviewState from '@/shared/hooks/useReviewState';

const CoverLetterPage = () => {
  const { state, actions } = useCoverLetterParams();
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const reviewState = useReviewState(state.selectedDocumentId || 0);

  const { currentReviews, currentPageIndex } = useReviewState(
    state.selectedDocumentId ?? 1,
  );

  const isWriteTab = state.currentTab === 'COVERLETTER_WRITE';
  const hasSelectedCoverLetter = state.selectedDocumentId !== null;

  const tabProps = {
    content: coverLetterContent,
    handleTabChange: actions.handleTabChange,
    currentTab: state.currentTab,
  };

  const handleReviewClick = useCallback((reviewId: string | null) => {
    setSelectedReviewId(reviewId);
  }, []);

  // 페이지가 바뀌면 선택 초기화 - key를 사용하여 컴포넌트 리마운트
  const pageKey = `${state.selectedDocumentId}-${currentPageIndex}`;

  return (
    <SidebarLayout
      headerSlot={
        <>
          <ContentHeader {...coverLetterHeaderText} />
          <TabBar {...tabProps} />
        </>
      }
      sidebarSlot={
        isWriteTab ? (
          <CoverLetterWriteSidebar />
        ) : (
          <ReviewSidebar
            selectedDocumentId={state.selectedDocumentId}
            onSelectDocument={actions.setSelectedDocumentId}
          />
        )
      }
      isReviewOpen={state.isReviewOpen}
    >
      <DataGuard
        data={hasSelectedCoverLetter}
        fallback={
          <EmptyCase
            {...(isWriteTab
              ? emptyCaseText.overview
              : emptyCaseText.qnAwithFriend)}
          />
        }
        className='h-full'
      >
        {isWriteTab ? (
          <NewCoverLetter />
        ) : (
          <div
            key={pageKey}
            className='flex h-full w-full min-w-0 flex-row pb-39.5'
          >
            <div className='h-full min-w-0 flex-1'>
              <CoverLetter
                documentId={state.selectedDocumentId!}
                openReview={actions.setIsReviewOpen}
                isReviewOpen={state.isReviewOpen}
                selectedReviewId={selectedReviewId}
                onReviewClick={handleReviewClick}
                reviewState={reviewState}
              />
            </div>

            {state.isReviewOpen && (
              <aside className='w-[248px] border-l border-gray-100'>
                <ReviewCardList
                  reviews={currentReviews}
                  selectedReviewId={selectedReviewId}
                  onReviewClick={handleReviewClick}
                />
              </aside>
            )}
          </div>
        )}
      </DataGuard>
    </SidebarLayout>
  );
};

export default CoverLetterPage;
