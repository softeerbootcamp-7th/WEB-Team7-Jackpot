import { Suspense, useEffect, useRef, useState } from 'react';

import libraryFolder from '@/assets/icons/LibraryFolder.svg';
import LibraryFolderGrid from '@/features/coverLetter/components/sidebar/LibraryFolderGrid';
import LibraryQnAList from '@/features/coverLetter/components/sidebar/LibraryQnAList';
import SidebarSelectableList from '@/features/coverLetter/components/sidebar/SidebarSelectableList';
import { useLibraryNavigation } from '@/features/coverLetter/hooks/useLibraryNavigation';
import type { ScrapItem } from '@/features/coverLetter/types/coverLetter';
import { useLibraryListQueries } from '@/features/library/hooks/queries/useLibraryListQueries';
import type { QnAsSearchResponse } from '@/features/library/types';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import SearchResultDisplay from '@/shared/components/SearchResultDisplay';
import SectionError from '@/shared/components/SectionError';
import SidebarCard from '@/shared/components/sidebar/SidebarCard';
import { SidebarSkeleton } from '@/shared/components/SidebarSkeleton';
import { useInfiniteQnASearch } from '@/shared/hooks/useQnAQueries';

const toScrapItem = (qna: QnAsSearchResponse): ScrapItem => ({
  id: qna.qnAId,
  companyName: qna.companyName,
  jobPosition: qna.jobPosition,
  applySeason: qna.applySeason ?? '',
  question: qna.question,
  answer: qna.answer ?? '',
  coverLetterId: qna.coverLetterId,
});

const QnASearchResultContainer = ({
  keyword,
  className,
  selectLibrary,
}: {
  keyword: string;
  className?: string;
  selectLibrary: (name: string) => void;
}) => {
  const {
    data: searchResults,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQnASearch(keyword);

  return (
    <SidebarSelectableList
      renderList={(onSelect) => (
        <SearchResultDisplay
          keyword={keyword}
          data={searchResults}
          className={className}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          renderLibraryItem={(libName) => (
            <button
              type='button'
              onClick={() => {
                selectLibrary(libName);
              }}
              aria-label={`${libName} 폴더 열기`}
              className='inline-flex h-30 w-30 flex-col items-center justify-center gap-2.5 rounded-lg px-3 pt-5 pb-4 transition-colors hover:bg-gray-50'
            >
              <img
                src={libraryFolder}
                alt='폴더 아이콘'
                className='h-[54px] w-[77.76px]'
              />
              <div className='text-caption-l line-clamp-1 w-24 justify-start text-center font-medium text-gray-950'>
                {libName}
              </div>
            </button>
          )}
          renderQnAItem={(qna) => (
            <SidebarCard
              item={toScrapItem(qna)}
              isScrap
              deleteScrap={() => {}}
              showDelete={false}
              onClick={() => {
                onSelect(toScrapItem(qna));
              }}
            />
          )}
        />
      )}
    />
  );
};

interface LibrarySearchResultProps {
  keyword: string;
  className?: string;
}

const LibrarySearchResult = ({
  keyword,
  className,
}: LibrarySearchResultProps) => {
  const { data: libraryData } = useLibraryListQueries('QUESTION');
  const folderList = libraryData?.folderList ?? [];

  const {
    selectedItem,
    selectedLibrary,
    selectLibrary,
    selectItem,
    goBackToLibraryList,
    goBackToSearchResult,
  } = useLibraryNavigation();

  // 1. 폴더가 열렸을 당시의 검색어를 박제(Snapshot)
  const [activeLibraryKeyword, setActiveLibraryKeyword] = useState(keyword);

  const handleSelectLibrary = (name: string) => {
    setActiveLibraryKeyword(keyword); // 폴더를 여는 순간의 검색어 저장
    selectLibrary(name);
  };

  const handleSelectItem = (item: ScrapItem) => {
    setActiveLibraryKeyword(keyword);
    selectItem(item);
  };

  // 2. 현재 검색어와 박제된 검색어가 다르면? = "사용자가 방금 타이핑을 했다!"
  // 즉시 렌더링 과정에서 폴더 뷰를 가리기 (상태 업데이트 없음, 깜빡임 0%)
  const isLibraryValid = keyword === activeLibraryKeyword;
  const effectiveSelectedLibrary = isLibraryValid ? selectedLibrary : null;
  const effectiveSelectedItem = isLibraryValid ? selectedItem : null;

  // 3.  커스텀 훅의 내부 Context를 정리하는 용도
  const effectKeywordRef = useRef(keyword);

  useEffect(() => {
    if (effectKeywordRef.current !== keyword) {
      effectKeywordRef.current = keyword;

      // 검색어가 바뀌었는데 Context에는 폴더가 남아있다면 정리
      if (selectedLibrary || selectedItem) {
        goBackToSearchResult();
      }
    }
  }, [keyword, selectedLibrary, selectedItem, goBackToSearchResult]);

  // [조건 1 & 3] selectedLibrary가 있는 경우 (검색어 변경 시 즉각 차단됨)
  if (effectiveSelectedLibrary) {
    return (
      <LibraryQnAList
        libraryName={effectiveSelectedLibrary}
        selectedItem={effectiveSelectedItem}
        onSelectItem={handleSelectItem} // 래핑된 함수 전달
        onBackToLibraryList={goBackToLibraryList}
        onBack={goBackToSearchResult}
      />
    );
  }

  // [조건 2] selectedLibrary가 없고 검색어가 2자 이상인 경우
  if (keyword.length >= 2) {
    return (
      <ErrorBoundary
        fallback={(reset) => (
          <SectionError
            onRetry={reset}
            text='라이브러리 검색 결과를 표시할 수 없습니다'
          />
        )}
      >
        <Suspense fallback={<SidebarSkeleton len={5} />}>
          <QnASearchResultContainer
            keyword={keyword}
            className={className}
            selectLibrary={handleSelectLibrary} // 👈 래핑된 함수 전달
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // [조건 4] selectedLibrary가 없고 검색어가 2자 미만인 경우
  return (
    <LibraryFolderGrid
      folderList={folderList}
      onSelectFolder={handleSelectLibrary} // 래핑된 함수 전달
    />
  );
};

export default LibrarySearchResult;
