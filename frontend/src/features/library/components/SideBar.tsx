// import useSearch from '../hooks/useSearch';
// 나중에 placeholder 문구 다시 확인
// 나중에 로직 안 붙였습니다.

import SearchInput from '../../../shared/components/SearchInput';
import type { LibraryView } from '../types';
import DocumentList from './DocumentList';
import FolderList from './FolderList';

interface SideBarProps {
  currentTab: LibraryView;
  folderList: string[];
  folderId: number | null;
  selectedDocumentId: number | null;
  selectedDocumentList: object[];
  handleFolderId: (id: number | null) => void;
  handleDocumentId: (id: number | null) => void;
}

const SideBar = ({
  currentTab,
  folderList,
  folderId,
  selectedDocumentId,
  selectedDocumentList,
  handleFolderId,
  handleDocumentId,
}: SideBarProps) => {
  const handleSearch = () => {};

  return (
    <div className='flex h-full w-107 flex-col overflow-hidden pt-7.5 pr-5'>
      {currentTab === 'QUESTIONS' && (
        <div className='flex-none shrink-0'>
          <SearchInput onSearch={handleSearch} placeholder='문항 유형을 입력해주세요' />
        </div>
      )}
      {folderId === null ? (
        <FolderList
          className='flex-1 overflow-y-auto'
          folderList={folderList}
          handleFolderId={handleFolderId}
        />
      ) : (
        <DocumentList
          className='flex-1 overflow-y-auto'
          selectedDocumentId={selectedDocumentId}
          selectedDocumentList={selectedDocumentList}
          handleFolderId={handleFolderId}
          handleDocumentId={handleDocumentId}
        />
      )}
    </div>
  );
};

export default SideBar;
