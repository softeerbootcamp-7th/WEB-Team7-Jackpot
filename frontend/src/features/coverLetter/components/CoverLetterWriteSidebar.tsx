import { useCallback, useState } from 'react';

import { useLocation, useNavigate } from 'react-router';

import Scrap from '@/features/coverLetter/components/Scrap';
import SideBar from '@/features/library/components/SideBar';
import useLibraryData from '@/features/library/hooks/useLibraryData';
import SearchInput from '@/shared/components/SearchInput';

const scrabList = Array.from({ length: 3 });

const CoverLetterWriteSidebar = ({
  currentSidebarTab,
  onTabChange,
}: {
  currentSidebarTab: 'scrap' | 'library';
  onTabChange: (tab: 'scrap' | 'library') => void;
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isScrap = currentSidebarTab === 'scrap';

  const handleTabChange = (tab: 'scrap' | 'library') => {
    onTabChange(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate({ search: params.toString() });
  };

  const handleSearch = useCallback(
    (keyword: string) => {
      const params = new URLSearchParams(location.search);
      params.set('tab', currentSidebarTab);
      params.set('search', keyword);
      navigate({ search: params.toString() }, { replace: true });
    },
    [currentSidebarTab, navigate, location.search],
  );

  // 라이브러리 탭용 상태
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null,
  );

  const { folderList, selectedDocumentList } = useLibraryData({
    currentTab: 'QUESTIONS',
    selectedFolderId,
    selectedDocumentId,
  });

  const deleteScrap = () => {};

  // TODO: 라이브러리 검색쪽 추후 공통 컴포넌트로 이동
  return (
    <div className='inline-flex w-[26.75rem] flex-col items-start justify-start gap-3 self-stretch pb-4'>
      <div className='flex flex-col items-center justify-start gap-3 self-stretch'>
        <div className='flex flex-col items-start justify-start gap-2.5 self-stretch px-3'>
          <div className='inline-flex h-12 items-center justify-start self-stretch overflow-hidden rounded-lg bg-gray-50 p-1'>
            <button
              onClick={() => handleTabChange('scrap')}
              className={`flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md px-16 py-2.5 ${
                isScrap
                  ? 'bg-white shadow-[0px_0px_10px_0px_rgba(41,41,41,0.06)]'
                  : ''
              }`}
            >
              <div
                className={`text-body-m justify-start ${isScrap ? 'font-bold text-gray-950' : 'font-normal text-gray-400'}`}
              >
                문항 스크랩
              </div>
            </button>
            <button
              onClick={() => handleTabChange('library')}
              className={`flex h-11 flex-1 items-center justify-center rounded-md px-10 py-2.5 ${
                !isScrap
                  ? 'bg-white shadow-[0px_0px_10px_0px_rgba(41,41,41,0.06)]'
                  : ''
              }`}
            >
              <div
                className={`text-body-m justify-start ${!isScrap ? 'font-bold text-gray-950' : 'font-normal text-gray-400'}`}
              >
                라이브러리 검색
              </div>
            </button>
          </div>
        </div>
        {isScrap && (
          <SearchInput
            onSearch={handleSearch}
            placeholder='문항 유형을 입력해주세요'
          />
        )}
      </div>

      {isScrap ? (
        scrabList.map((_, idx) => (
          <Scrap key={idx} coverLetterId={idx + 1} deleteScrap={deleteScrap} />
        ))
      ) : (
        <SideBar
          currentTab='QUESTIONS'
          folderList={folderList}
          folderId={selectedFolderId}
          selectedDocumentId={selectedDocumentId}
          selectedDocumentList={selectedDocumentList}
          handleFolderId={setSelectedFolderId}
          handleDocumentId={setSelectedDocumentId}
        />
      )}
    </div>
  );
};

export default CoverLetterWriteSidebar;
