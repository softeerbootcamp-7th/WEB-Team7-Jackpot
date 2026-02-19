import { useEffect, useRef } from 'react';

import { useParams, useSearchParams } from 'react-router';

import { searchLibrary } from '@/features/library/api';
import CompanyDocumentList from '@/features/library/components/company/CompanyDocumentList';
import FolderList from '@/features/library/components/FolderList';
import QnADocumentList from '@/features/library/components/qna/QnADocumentList';
import QnASearchResult from '@/features/library/components/qna/QnASearchResult';
import { useLibraryTabs } from '@/features/library/hooks/useLibraryTabs';
import SearchInput from '@/shared/components/SearchInput';
import useSearch from '@/shared/hooks/useSearch';

interface LibrarySideBarProps {
  folderList: string[];
}

const STORAGE_KEY = 'LIB_QNA_SEARCH_KEYWORD';

const LibrarySideBar = ({ folderList }: LibrarySideBarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentTab } = useLibraryTabs();

  // 탭 변경 감지용 Ref
  const prevTabRef = useRef(currentTab);

  const {
    keyword,
    handleChange,
    data: searchResults,
    isLoading,
    errorMessage,
  } = useSearch({
    queryKey: 'keyword',
    fetchAction: searchLibrary,
    // 기업 탭일 땐 useSearch 기능을 꺼버려서 URL 깜빡임 원천 차단
    isEnabled: currentTab === 'QUESTION',
  });

  const { companyName, qnAName } = useParams<{
    companyName?: string;
    qnAName?: string;
  }>();

  // 탭이 'QUESTION'으로 바뀌는 순간 딱 한 번만 실행 (복원)
  useEffect(() => {
    if (currentTab === 'QUESTION' && prevTabRef.current !== 'QUESTION') {
      const savedKeyword = localStorage.getItem(STORAGE_KEY);
      const currentUrlKeyword = searchParams.get('keyword');

      // URL엔 없는데 저장된 게 있으면 -> 복원
      if (!currentUrlKeyword && savedKeyword) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('keyword', savedKeyword);
        setSearchParams(nextParams, { replace: true });
      }
    }

    // 기업 탭으로 가면 URL 파라미터 정리
    if (currentTab === 'COMPANY' && searchParams.has('keyword')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('keyword');
      setSearchParams(nextParams, { replace: true });
    }

    prevTabRef.current = currentTab;
  }, [currentTab, searchParams, setSearchParams]);

  // 문항 탭에서 검색어가 바뀔 때마다 저장 (동기화)
  useEffect(() => {
    if (currentTab === 'QUESTION') {
      // keyword가 빈 문자열이어도 저장해야 함 (사용자가 지운 상태를 기억하기 위해)
      // 단, 초기 로딩 시점의 null/undefined 방지를 위해 체크
      if (typeof keyword === 'string') {
        if (keyword.length > 0) {
          localStorage.setItem(STORAGE_KEY, keyword);
        } else {
          // 사용자가 다 지웠으면 스토리지도 비워야 다음 복원 때 빈 값으로 복원됨
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [keyword, currentTab]);

  const folderName = currentTab === 'COMPANY' ? companyName : qnAName;

  const renderContent = () => {
    if (currentTab === 'QUESTION' && keyword && keyword.length >= 2) {
      // 문항 탭이면서 사용자가 이미 검색어를 입력한 경우

      return (
        <QnASearchResult
          keyword={keyword}
          data={searchResults}
          isLoading={isLoading}
          className='flex-1 overflow-y-auto'
        />
      );
    }

    if (folderName === undefined) {
      return (
        <FolderList
          className='flex-1 overflow-y-auto'
          folderList={folderList}
        />
      );
    }

    if (currentTab === 'QUESTION') {
      return <QnADocumentList className='flex-1 overflow-y-auto' />;
    }

    return <CompanyDocumentList className='flex-1 overflow-y-auto' />;
  };

  return (
    <div className='flex h-full w-107 flex-col overflow-hidden pr-5'>
      {currentTab === 'QUESTION' && (
        <div className='flex-none shrink-0'>
          <SearchInput
            placeholder='문항 유형을 입력해주세요'
            keyword={keyword}
            onChange={handleChange}
            errorMessage={errorMessage}
          />
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default LibrarySideBar;
