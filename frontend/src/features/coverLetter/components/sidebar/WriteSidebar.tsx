import { useLocation, useNavigate } from 'react-router';

import LibrarySearchResult from '@/features/coverLetter/components/sidebar/LibrarySearchResult';
import SidebarCardSection from '@/features/coverLetter/components/sidebar/SidebarCardSection';
import SearchInput from '@/shared/components/SearchInput';
import SidebarSkeleton from '@/shared/components/SidebarSkeleton'; // 💡 스켈레톤 추가
import { useSearch } from '@/shared/hooks/useSearch';

const SCRAP_STORAGE_KEY = 'WRITE_SCRAP_SEARCH_KEYWORD';
const LIBRARY_STORAGE_KEY = 'WRITE_LIBRARY_SEARCH_KEYWORD';

const WriteSidebar = ({
  currentSidebarTab,
  onTabChange,
}: {
  currentSidebarTab: 'scrap' | 'library';
  onTabChange: (tab: 'scrap' | 'library') => void;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isScrap = currentSidebarTab === 'scrap';

  // 1. 탭 상태에 따라 알아서 스토리지를 갈아끼우는 useSearch
  const {
    keyword,
    handleChange,
    currentQueryParam,
    isInitializing, // 탭 전환 틈을 막아줄 방어막
  } = useSearch({
    queryKey: 'search',
    storageKey: isScrap ? SCRAP_STORAGE_KEY : LIBRARY_STORAGE_KEY,
  });

  // 2. 탭 전환 시 선제적 동기화 라우팅
  const handleTabChange = (tab: 'scrap' | 'library') => {
    onTabChange(tab);

    // 이동하려는 탭의 로컬 스토리지 값을 미리 확인
    const nextStorageKey =
      tab === 'scrap' ? SCRAP_STORAGE_KEY : LIBRARY_STORAGE_KEY;
    const savedKeyword = localStorage.getItem(nextStorageKey) || '';

    const params = new URLSearchParams(location.search);
    params.set('tab', tab);

    // 무조건 삭제하는 것이 아니라, 저장된 값이 있으면 살리고 없으면 지우기
    if (savedKeyword) {
      params.set('search', savedKeyword);
    } else {
      params.delete('search');
    }

    // 즉시 URL을 갈아끼웁니다.
    navigate({ search: params.toString() }, { replace: true });
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
          keyword={keyword}
          placeholder={
            isScrap
              ? '질문 또는 답변을 입력해주세요'
              : '문항 유형을 입력해주세요'
          }
        />
      </div>

      {/* 콘텐츠 영역 (내부 스크롤) */}
      <div className='min-h-0 w-full flex-1 overflow-y-auto'>
        {/* 3. 깜빡임 틈(URL과 State가 맞춰지는 1프레임)을 메워주는 스켈레톤 로딩 */}
        {isInitializing ? (
          <SidebarSkeleton len={5} />
        ) : isScrap ? (
          // 스크랩 탭 → 스크랩 목록 표시
          <SidebarCardSection searchWord={currentQueryParam} />
        ) : (
          // 라이브러리 탭 → LibrarySearchResult가 처리
          <LibrarySearchResult keyword={currentQueryParam} className='w-full' />
        )}
      </div>
    </div>
  );
};

export default WriteSidebar;
