import DetailView from '@/features/library/components/DetailView';
import ScrapNum from '@/features/library/components/ScrapNum';
import SideBar from '@/features/library/components/SideBar';
import {
  emptyCaseText,
  libraryContent,
  libraryHeaderText,
} from '@/features/library/constants';
import useLibraryData from '@/features/library/hooks/useLibraryData';
import useLibraryParams from '@/features/library/hooks/useLibraryParams';
import useScrapNum from '@/features/library/hooks/useScrapNum';
import ContentHeader from '@/shared/components/ContentHeader';
import DataGuard from '@/shared/components/DataGuard';
import EmptyCase from '@/shared/components/EmptyCase';
import SidebarLayout from '@/shared/components/SidebarLayout';
import TabBar from '@/shared/components/TabBar';

const LibraryPage = () => {
  const { state, actions } = useLibraryParams();

  // addScrap, deleteScrap 기능 추후에 추가
  const { scrapNum } = useScrapNum();

  // selectedDocument는 기업 라이브러리 자기소개서 API 명세를 BE와 확인한 후에 다시 수정
  const { folderList, selectedDocumentList } = useLibraryData({
    currentTab: state.currentTab,
    selectedFolderId: state.selectedFolderId,
    selectedDocumentId: state.selectedDocumentId,
  });

  const sideBarContent = {
    currentTab: state.currentTab,
    folderList: folderList,
    folderId: state.selectedFolderId,
    selectedDocumentList: selectedDocumentList,
    selectedDocumentId: state.selectedDocumentId,
    handleFolderId: actions.setSelectedFolderId,
    handleDocumentId: actions.setSelectedDocumentId,
  };

  const tabProps = {
    content: libraryContent,
    handleTabChange: actions.handleTabChange,
    currentTab: state.currentTab,
  };

  const hasData = folderList.length > 0;

  return (
    <SidebarLayout
      headerSlot={
        <>
          <ContentHeader {...libraryHeaderText} />
          <div className='flex flex-row items-center justify-between'>
            <TabBar {...tabProps} />
            <ScrapNum value={scrapNum} />
          </div>
        </>
      }
      sidebarSlot={hasData && <SideBar {...sideBarContent} />}
    >
      <DataGuard
        data={hasData}
        fallback={<EmptyCase {...emptyCaseText.overview} />}
      >
        <DetailView />
      </DataGuard>
    </SidebarLayout>
  );
};

export default LibraryPage;
