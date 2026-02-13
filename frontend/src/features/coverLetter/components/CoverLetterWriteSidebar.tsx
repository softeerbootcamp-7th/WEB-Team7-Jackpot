import { Suspense, useCallback, useState } from 'react';

import { useLocation, useNavigate, useSearchParams } from 'react-router';

import ScrapSection from '@/features/coverLetter/components/ScrapSection';
import SideBar from '@/features/library/components/SideBar';
import useLibraryData from '@/features/library/hooks/useLibraryData';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import SearchInput from '@/shared/components/SearchInput';
import SectionError from '@/shared/components/SectionError';
import { SidebarSkeleton } from '@/shared/components/SidebarSkeleton';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { validateSearchKeyword } from '@/shared/utils/validation';

const CoverLetterWriteSidebar = ({
  currentSidebarTab,
  onTabChange,
}: {
  currentSidebarTab: 'scrap' | 'library';
  onTabChange: (tab: 'scrap' | 'library') => void;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isScrap = currentSidebarTab === 'scrap';
  const searchWord = searchParams.get('search') ?? '';

  const { showToast } = useToastMessageContext();

  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null,
  );

  const { folderList, selectedDocumentList } = useLibraryData({
    currentTab: 'QUESTIONS',
    selectedFolderId,
    selectedDocumentId,
  });

  const handleTabChange = (tab: 'scrap' | 'library') => {
    onTabChange(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate({ search: params.toString() });
  };

  const handleSearch = useCallback(
    (keyword: string) => {
      const { isValid, message } = validateSearchKeyword(keyword);
      if (!isValid && message) {
        showToast(message);
        return;
      }

      const params = new URLSearchParams(location.search);
      params.set('tab', currentSidebarTab);
      params.set('search', keyword);
      navigate({ search: params.toString() }, { replace: true });
    },
    [currentSidebarTab, navigate, location.search, showToast],
  );

  const deleteScrap = () => {
    // TODO: Scrap 취소 api 연결 필요
  };

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
        <ErrorBoundary
          key={searchWord}
          fallback={(reset) => (
            <SectionError
              onRetry={reset}
              text='스크랩 목록을 표시할 수 없습니다'
            />
          )}
        >
          <Suspense fallback={<SidebarSkeleton />}>
            <ScrapSection searchWord={searchWord} deleteScrap={deleteScrap} />
          </Suspense>
        </ErrorBoundary>
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
