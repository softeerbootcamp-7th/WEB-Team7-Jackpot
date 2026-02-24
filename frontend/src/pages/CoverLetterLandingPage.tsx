import { Suspense, useState } from 'react';

import NewCoverLetterButton from '@/features/coverLetter/components/overview/NewCoverLetterButton';
import OverviewSection from '@/features/coverLetter/components/overview/OverviewSection';
import * as CI from '@/features/coverLetter/icons';
import CoverLetterOverviewSkeleton from '@/features/home/components/CoverLetterOverviewSkeleton';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import SearchInput from '@/shared/components/SearchInput';
import SectionError from '@/shared/components/SectionError';
import useSearch from '@/shared/hooks/useSearch';

const CoverLetterLandingPage = () => {
  const [isFilterActive, setIsFilterActive] = useState(false);

  //  URL 상태 동기화 및 검색 로직을 담당하는 커스텀 훅
  const {
    keyword,
    handleChange,
    page: searchPage,
    handlePageChange: handleSearchPageChange,
    currentQueryParam, // 디바운싱이 끝난 "진짜 검색어"
  } = useSearch({
    queryKey: 'keyword',
    pageKey: 'page',
  });

  const handleFilterToggle = () => {
    setIsFilterActive((prev) => !prev);
  };

  return (
    <div className='flex h-full flex-col'>
      {/* 1. 상단 검색바 및 버튼 영역 */}
      <div className='flex items-center justify-between pb-[30px]'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <SearchInput
            placeholder='기업명, 직무명을 입력해주세요'
            keyword={keyword}
            onChange={handleChange}
          />
          <button
            type='button'
            onClick={handleFilterToggle}
            aria-pressed={isFilterActive}
            className={`flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 transition-colors duration-200 ${
              isFilterActive
                ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CI.ReviewWithFriendIcon className='h-5 w-5' />
            <span className='text-body-s font-medium whitespace-nowrap'>
              친구와 함께 첨삭
            </span>
          </button>
        </div>
        <div className='shrink-0 pl-3'>
          <NewCoverLetterButton />
        </div>
      </div>

      {/* 2. 하단 리스트 영역 (페이지네이션 잘림 방지를 위해 flex-col과 overflow-y-auto 사용) */}
      <div className='flex flex-1 flex-col overflow-y-auto'>
        <ErrorBoundary
          key={`${currentQueryParam}|${isFilterActive}`}
          fallback={(reset) => (
            <SectionError
              onRetry={reset}
              text='자기소개서 목록을 표시할 수 없습니다'
            />
          )}
        >
          {/* React Query의 로딩 상태는 부모의 Suspense가 알아서 캐치합니다 */}
          <Suspense fallback={<CoverLetterOverviewSkeleton len={9} />}>
            <div className='flex h-full w-full flex-1 flex-col pb-10'>
              <OverviewSection
                searchWord={currentQueryParam}
                isFilterActive={isFilterActive}
                page={searchPage}
                onPageChange={handleSearchPageChange}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default CoverLetterLandingPage;
