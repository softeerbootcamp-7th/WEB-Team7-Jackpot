import { Suspense } from 'react';

import { useParams } from 'react-router';

import CompanyDocumentList from '@/features/library/components/company/CompanyDocumentList';
import FolderList from '@/features/library/components/FolderList';
import QnADocumentList from '@/features/library/components/qna/QnADocumentList';
import QnASearchResult from '@/features/library/components/qna/QnASearchResult';
import { useLibraryTabs } from '@/features/library/hooks/useLibraryTabs';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import SearchInput from '@/shared/components/SearchInput';
import SidebarSkeleton from '@/shared/components/SidebarSkeleton';
import { useSearch } from '@/shared/hooks/useSearch';

const STORAGE_KEY = 'LIB_QNA_SEARCH_KEYWORD';

interface LibrarySideBarProps {
  folderList: string[];
}

const LibrarySideBar = ({ folderList }: LibrarySideBarProps) => {
  const { currentTab } = useLibraryTabs();
  const { companyName, qnAName } = useParams<{
    companyName?: string;
    qnAName?: string;
  }>();

  const isQuestionTab = currentTab === 'QUESTION';

  // 1. useSearch 훅을 호출
  const {
    keyword,
    handleChange,
    currentQueryParam,
    isInitializing, // URL 동기화를 기다리는 찰나의 순간에 true
    handleClear,
  } = useSearch({
    queryKey: 'keyword',
    storageKey: STORAGE_KEY,
    activeCondition: isQuestionTab,
  });

  const folderName = currentTab === 'COMPANY' ? companyName : qnAName;

  // 하위 콘텐츠 렌더링을 담당하는 함수
  const renderContent = () => {
    // 로컬엔 검색어가 있는데 URL엔 아직 없는 그 '1프레임 틈'일 때 무조건 스켈레톤!
    // 이 코드 덕분에 탭을 돌아왔을 때 '폴더 리스트'가 잠깐 보이는 깜빡임 현상이 원천 차단
    if (isInitializing) {
      return <SidebarSkeleton len={5} />;
    }

    // 동기화 완료 후, 검색어가 2자 이상이면 검색 결과 컴포넌트 렌더링
    if (isQuestionTab && currentQueryParam && currentQueryParam.length >= 2) {
      return (
        <ErrorBoundary
          fallback={
            <p className='p-4 text-center text-gray-500'>
              검색 결과를 불러오지 못했습니다.
            </p>
          }
        >
          <Suspense fallback={<SidebarSkeleton len={5} />}>
            <QnASearchResult
              searchWord={currentQueryParam}
              className='flex-1 overflow-y-auto'
              onClearSearch={handleClear} // 좀비 URL 쿼리 차단용 함수 전달
            />
          </Suspense>
        </ErrorBoundary>
      );
    }

    // 검색어가 없거나 2자 미만일 때: 폴더를 선택하지 않은 경우 폴더 리스트 표시
    if (folderName === undefined) {
      return (
        <FolderList
          className='flex-1 overflow-y-auto'
          folderList={folderList}
        />
      );
    }

    // 폴더를 선택한 경우 해당 폴더의 문서 리스트 표시
    if (isQuestionTab) {
      return <QnADocumentList className='flex-1 overflow-y-auto' />;
    }

    return <CompanyDocumentList className='flex-1 overflow-y-auto' />;
  };

  return (
    <div className='flex h-full w-107 flex-col overflow-hidden pr-5'>
      {/* 문항 탭일 때만 검색창을 표시 */}
      {isQuestionTab && (
        <div className='flex-none shrink-0 pb-6'>
          <SearchInput
            placeholder='문항 유형을 입력해주세요'
            keyword={keyword}
            onChange={handleChange}
          />
        </div>
      )}

      {/* 렌더링 로직의 결과물 */}
      {renderContent()}
    </div>
  );
};

export default LibrarySideBar;
