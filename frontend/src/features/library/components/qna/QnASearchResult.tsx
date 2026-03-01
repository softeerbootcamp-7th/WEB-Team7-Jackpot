import { useNavigate } from 'react-router';

import libraryFolder from '@/assets/icons/LibraryFolder.svg';
import type { QnAsSearchResponse } from '@/features/library/types';
import SearchResultDisplay from '@/shared/components/SearchResultDisplay';
import SidebarCard from '@/shared/components/sidebar/SidebarCard';
import { useInfiniteQnASearch } from '@/shared/hooks/useQnAQueries';
import type { ScrapItem } from '@/shared/types/coverLetter';

interface QnASearchResultProps {
  searchWord: string;
  className?: string;
  onClearSearch: () => void;
}

const toScrapItem = (qna: QnAsSearchResponse): ScrapItem => ({
  id: qna.qnAId,
  companyName: qna.companyName,
  jobPosition: qna.jobPosition,
  applySeason: qna.applySeason ?? '',
  question: qna.question,
  answer: qna.answer ?? '',
  coverLetterId: qna.coverLetterId,
});

// 폴더나 문항을 선택하는 경우 onClearSearch가 호출되면서 검색어가 초기화
const QnASearchResult = ({
  searchWord,
  className,
  onClearSearch,
}: QnASearchResultProps) => {
  const navigate = useNavigate();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQnASearch(searchWord);

  return (
    <SearchResultDisplay
      keyword={searchWord}
      data={data}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      className={className}
      renderLibraryItem={(libName) => (
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            onClearSearch();
            navigate(`/library/qna/${encodeURIComponent(libName)}`);
          }}
          aria-label={`${libName} 폴더 열기`}
          className='inline-flex w-28 shrink-0 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-lg px-3 pt-5 pb-4 transition-colors duration-200 hover:bg-gray-100'
        >
          <img src={libraryFolder} alt='' className='h-[54px] w-[77.76px]' />
          <div className='text-caption-l line-clamp-1 w-24 justify-start text-center font-medium text-gray-950'>
            {libName}
          </div>
        </button>
      )}
      renderQnAItem={(qna) => (
        <SidebarCard
          item={toScrapItem(qna)}
          isScrap
          showDelete={false}
          onClick={() => {
            // 4. 깔끔하게 분리된 함수 사용
            onClearSearch(); // 검색어 초기화로 안전하게 라이브러리 진입
            // questionCategoryType은 항상 존재함 (API 응답 보장)
            navigate(
              `/library/qna/${encodeURIComponent(qna.questionCategoryType ?? '')}/${qna.qnAId}`,
            );
          }}
        />
      )}
    />
  );
};

export default QnASearchResult;
