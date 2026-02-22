import { Suspense, useCallback, useState } from 'react';

import NewCoverLetterButton from '@/features/coverLetter/components/overview/NewCoverLetterButton';
import OverviewSection from '@/features/coverLetter/components/overview/OverviewSection';
import * as CI from '@/features/coverLetter/icons';
import CoverLetterOverviewSkeleton from '@/features/home/components/CoverLetterOverviewSkeleton';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import SearchInput from '@/shared/components/SearchInput';
import SectionError from '@/shared/components/SectionError';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { validateSearchKeyword } from '@/shared/utils/validation';

const CoverLetterLandingPage = () => {
  const [searchWord, setSearchWord] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [searchKey, setSearchKey] = useState(0);
  const [page, setPage] = useState(0);
  const { showToast } = useToastMessageContext();

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const word = e.target.value;
      const { isValid, message } = validateSearchKeyword(word);
      if (!isValid && message) {
        showToast(message);
        return;
      }
      if (word) {
        setIsFilterActive(false);
      }
      setSearchWord(word);
      setPage(0);
    },
    [showToast],
  );

  const handleFilterToggle = () => {
    const next = !isFilterActive;
    setIsFilterActive(next);
    if (next) {
      setSearchWord('');
      setSearchKey((prev) => prev + 1);
    }
    setPage(0);
  };

  return (
    <>
      <div className='flex items-center justify-between pb-[30px]'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <SearchInput
            key={searchKey}
            onChange={handleSearch}
            placeholder='기업명, 직무명을 입력해주세요'
            keyword={searchWord}
            errorMessage={null}
          />
          <button
            type='button'
            onClick={handleFilterToggle}
            aria-pressed={isFilterActive}
            className={`flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-4 transition-colors ${
              isFilterActive
                ? 'border-purple-500 bg-purple-50 text-purple-600'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
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
      <div className='flex flex-1 items-center'>
        <ErrorBoundary
          key={`${searchWord}|${isFilterActive}`}
          fallback={(reset) => (
            <SectionError
              onRetry={reset}
              text='작성중인 자기소개서 목록을 표시할 수 없습니다'
            />
          )}
        >
          <Suspense fallback={<CoverLetterOverviewSkeleton len={9} />}>
            <div className='flex h-full flex-1'>
              <OverviewSection
                searchWord={searchWord}
                isFilterActive={isFilterActive}
                page={page}
                onPageChange={setPage}
              />
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default CoverLetterLandingPage;
