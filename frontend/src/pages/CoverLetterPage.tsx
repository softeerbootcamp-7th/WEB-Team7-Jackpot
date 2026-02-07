import CoverLetterWriteSidebar from '@/features/coverLetter/components/CoverLetterWriteSidebar';
import NewCoverLetter from '@/features/coverLetter/components/newCoverLetter/NewCoverLetter';
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
  const hasData = true;

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
      sidebarSlot={<CoverLetterWriteSidebar />}
    >
      <DataGuard
        data={hasData}
        fallback={<EmptyCase {...emptyCaseText.overview} />}
      >
        {state.currentTab === 'COVERLETTER_WRITE' ? <NewCoverLetter /> : ''}
      </DataGuard>
    </SidebarLayout>
  );
};

export default CoverLetterPage;
