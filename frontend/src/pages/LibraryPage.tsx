import DetailView from '@/features/library/components/DetailView';
import LibraryLayout from '@/features/library/components/LibraryLayout';
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
import TabBar from '@/shared/components/TabBar';

const LibraryPage = () => {
  const { state, actions } = useLibraryParams();

  // addScrab, deleteScrab 기능 추후에 추가
  const { scrabNum } = useScrapNum();

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

  return (
    <div className='h-screen w-full max-w-screen min-w-[1700px] overflow-hidden px-75'>
      {/* <Header /> 수정 */}
      <ContentHeader {...libraryHeaderText} />
      <div className='flex flex-row items-center justify-between'>
        <TabBar
          content={libraryContent}
          handleTabChange={actions.handleTabChange}
          currentTab={state.currentTab}
        />
        <ScrapNum value={scrabNum} />
      </div>
      <DataGuard
        data={folderList.length > 0}
        fallback={<EmptyCase {...emptyCaseText.overview} />}
      >
        <LibraryLayout sidebarSlot={<SideBar {...sideBarContent} />}>
          <DetailView />
        </LibraryLayout>
      </DataGuard>
    </div>
  );
};

export default LibraryPage;
