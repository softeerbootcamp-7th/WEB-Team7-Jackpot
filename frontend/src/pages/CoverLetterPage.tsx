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

const CoverLetterPage = () => {
  // TODO: 전체 empty case 처리 필요
  // 자기소개서 작성 엠티케이스
  // QnA with a Friend 엠티케이스

  const { state, actions } = useCoverLetterParams();

  const isWriteTab = state.currentTab === 'COVERLETTER_WRITE';
  const hasSelectedCoverLetter = state.selectedDocumentId !== null;

  const tabProps = {
    content: coverLetterContent,
    handleTabChange: actions.handleTabChange,
    currentTab: state.currentTab,
  };

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
      >
        {isWriteTab ? (
          <NewCoverLetter />
        ) : (
          <div className='flex h-full w-full min-w-0'>
            <div className='min-w-0 flex-1'>
              <CoverLetter
                documentId={state.selectedDocumentId!}
                openReview={actions.setIsReviewOpen}
                isReviewOpen={state.isReviewOpen}
              />
            </div>

            {state.isReviewOpen && (
              <aside className='w-[360px] flex-none border-l border-gray-100'>
                <ReviewCardList />
              </aside>
            )}
          </div>
        )}
      </DataGuard>
    </SidebarLayout>
  );
};

export default CoverLetterPage;
