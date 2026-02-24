import { Suspense } from 'react';

import { useLocation, useNavigate } from 'react-router';

import LibraryFolderGrid from '@/features/coverLetter/components/sidebar/LibraryFolderGrid';
import LibraryQnAList from '@/features/coverLetter/components/sidebar/LibraryQnAList';
import LibrarySearchResult from '@/features/coverLetter/components/sidebar/LibrarySearchResult';
import SidebarCardSection from '@/features/coverLetter/components/sidebar/SidebarCardSection';
import { useLibraryNavigation } from '@/features/coverLetter/hooks/useLibraryNavigation';
import { useLibraryListQueries } from '@/features/library/hooks/queries/useLibraryListQueries';
import { searchLibrary } from '@/shared/api/qnaApi';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import SearchInput from '@/shared/components/SearchInput';
import SectionError from '@/shared/components/SectionError';
import { SidebarSkeleton } from '@/shared/components/SidebarSkeleton';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import useInfiniteSearch from '@/shared/hooks/useInfiniteSearch';
import { useDeleteScrapMutation } from '@/shared/hooks/useScrapQueries';

const WriteSidebar = ({
  currentSidebarTab,
  onTabChange,
}: {
  currentSidebarTab: 'scrap' | 'library';
  onTabChange: (tab: 'scrap' | 'library') => void;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToastMessageContext();

  // 라이브러리 검색 네비게이션 상태 관리
  const {
    selectedItem,
    selectedLibrary,
    selectLibrary,
    selectItem,
    goBackToLibraryList,
    goBackToSearchResult,
  } = useLibraryNavigation();

  // 라이브러리 폴더 리스트 가져오기
  const { data: libraryData } = useLibraryListQueries('QUESTION');
  const folderList = libraryData?.folderList ?? [];

  const isScrap = currentSidebarTab === 'scrap';

  const {
    keyword,
    handleChange,
    currentQueryParam,
    data: searchResults,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteSearch({
    queryKey: 'keyword',
    fetchAction: searchLibrary,
    isEnabled: !isScrap, // 라이브러리 탭일 때만 검색 활성화
  });

  // 삭제 API 훅 가져오기
  const { mutate: deleteScrapMutation } = useDeleteScrapMutation();

  const handleTabChange = (tab: 'scrap' | 'library') => {
    onTabChange(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    params.delete('search');
    navigate({ search: params.toString() });
  };

  // 스크랩 삭제 함수 구현
  const deleteScrap = (id: number) => {
    deleteScrapMutation(id, {
      onSuccess: () => {
        showToast('스크랩이 삭제되었습니다.');
      },
      onError: () => {
        showToast('처리에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  return (
    <div className='flex h-full w-[26.75rem] flex-col items-start justify-start gap-3 self-stretch pb-4'>
      {/* 탭 & 검색 영역 (고정 높이) */}
      <div className='flex flex-none shrink-0 flex-col items-center justify-start gap-3 self-stretch'>
        <div className='flex flex-col items-start justify-start gap-2.5 self-stretch px-3'>
          <div className='inline-flex h-12 items-center justify-start gap-2 self-stretch overflow-hidden rounded-lg bg-gray-50 p-1'>
            <button
              onClick={() => handleTabChange('scrap')}
              className={`flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md px-10 py-2.5 transition-all ${
                isScrap
                  ? 'cursor-default bg-white shadow-[0px_0px_10px_0px_rgba(41,41,41,0.06)]'
                  : 'cursor-pointer duration-200 hover:bg-gray-100'
              }`}
            >
              <div
                className={`text-body-m justify-start ${
                  isScrap
                    ? 'font-bold text-gray-950'
                    : 'font-normal text-gray-400'
                }`}
              >
                문항 스크랩
              </div>
            </button>
            <button
              onClick={() => handleTabChange('library')}
              className={`flex h-11 flex-1 items-center justify-center rounded-md px-10 py-2.5 transition-all ${
                !isScrap
                  ? 'cursor-default bg-white shadow-[0px_0px_10px_0px_rgba(41,41,41,0.06)]'
                  : 'cursor-pointer duration-200 hover:bg-gray-100'
              }`}
            >
              <div
                className={`text-body-m justify-start ${
                  !isScrap
                    ? 'font-bold text-gray-950'
                    : 'font-normal text-gray-400'
                }`}
              >
                라이브러리 검색
              </div>
            </button>
          </div>
        </div>
        <SearchInput
          onChange={handleChange}
          placeholder={
            isScrap
              ? '질문 또는 답변을 입력해주세요'
              : '문항 유형을 입력해주세요'
          }
          keyword={keyword}
        />
      </div>

      {/* 콘텐츠 영역 (내부 스크롤) */}
      <div className='min-h-0 w-full flex-1 overflow-y-auto'>
        {!isScrap && selectedLibrary ? (
          // 라이브러리 탭 + 폴더 선택됨 → 문항 리스트 표시
          <LibraryQnAList
            libraryName={selectedLibrary}
            selectedItem={selectedItem}
            onSelectItem={selectItem}
            onBackToLibraryList={goBackToLibraryList}
            onBack={goBackToSearchResult}
          />
        ) : !isScrap && keyword && keyword.length >= 2 ? (
          // 라이브러리 탭 + 검색어 2자 이상 → 검색 결과 표시
          <LibrarySearchResult
            keyword={keyword}
            data={searchResults}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            className='w-full'
            selectedItem={selectedItem}
            selectedLibrary={selectedLibrary}
            onSelectItem={selectItem}
            onSelectLibrary={selectLibrary}
            onBackToLibraryList={goBackToLibraryList}
            onBackToSearchResult={goBackToSearchResult}
          />
        ) : !isScrap ? (
          // 라이브러리 탭 + 검색어 없음 → 폴더 그리드 표시
          <LibraryFolderGrid
            folderList={folderList}
            onSelectFolder={selectLibrary}
          />
        ) : (
          // 스크랩 탭 → 스크랩 목록 표시
          <ErrorBoundary
            key={`${currentSidebarTab}-${currentQueryParam}`}
            fallback={(reset) => (
              <SectionError
                onRetry={reset}
                text={
                  isScrap
                    ? '스크랩 목록을 표시할 수 없습니다'
                    : '자기소개서 목록을 표시할 수 없습니다'
                }
              />
            )}
          >
            <div className='w-full pt-3'>
              <Suspense fallback={<SidebarSkeleton />}>
                <SidebarCardSection
                  searchWord={currentQueryParam}
                  deleteScrap={deleteScrap}
                />
              </Suspense>
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default WriteSidebar;
