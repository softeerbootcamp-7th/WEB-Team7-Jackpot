import { Suspense } from 'react';

import { useLocation, useNavigate } from 'react-router';

import SidebarCardSection from '@/features/coverLetter/components/sidebar/SidebarCardSection';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import SearchInput from '@/shared/components/SearchInput';
import SectionError from '@/shared/components/SectionError';
import { SidebarSkeleton } from '@/shared/components/SidebarSkeleton';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { useDeleteScrapMutation } from '@/shared/hooks/useScrapQueries';
import useSearch from '@/shared/hooks/useSearch';

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

  const isScrap = currentSidebarTab === 'scrap';

  const { keyword, handleChange, currentQueryParam } = useSearch({
    queryKey: 'search',
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
      onError: (error) => {
        showToast('처리에 실패했습니다. 다시 시도해주세요.');
        console.error(error);
      },
    });
  };

  return (
    <div className='inline-flex w-[26.75rem] flex-col items-start justify-start self-stretch pb-4'>
      <div className='flex flex-col items-center justify-start gap-3 self-stretch'>
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
        <div className='pt-3 w-full'>
          <Suspense fallback={<SidebarSkeleton />}>
            <SidebarCardSection
              searchWord={currentQueryParam}
              isScrap={isScrap}
              deleteScrap={deleteScrap}
            />
          </Suspense>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default WriteSidebar;
