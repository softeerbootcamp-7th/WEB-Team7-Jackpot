import CoverLetterReviewContent from '@/features/coverLetter/components/CoverLetterReviewContent';
import CoverLetterWriteSidebar from '@/features/coverLetter/components/CoverLetterWriteSidebar';
import NewCoverLetter from '@/features/coverLetter/components/newCoverLetter/NewCoverLetter';
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
          <CoverLetterReviewContent
            key={state.selectedDocumentId}
            selectedDocumentId={state.selectedDocumentId!}
            isReviewOpen={state.isReviewOpen}
            setIsReviewOpen={actions.setIsReviewOpen}
          />
        )}
      </DataGuard>
    </SidebarLayout>
  );
};

export default CoverLetterPage;
