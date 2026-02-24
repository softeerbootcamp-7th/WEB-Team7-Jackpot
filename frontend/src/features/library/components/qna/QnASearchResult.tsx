import { useNavigate } from 'react-router';

import type { ScrapItem } from '@/features/coverLetter/types/coverLetter';
import type {
  QnASearchResponse,
  QnAsSearchResponse,
} from '@/features/library/types';
import SearchResultDisplay from '@/shared/components/SearchResultDisplay';
import SidebarCard from '@/shared/components/sidebar/SidebarCard';
import * as SI from '@/shared/icons';

interface QnASearchResultProps {
  keyword: string;
  data: QnASearchResponse | null;
  isLoading: boolean;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  className?: string;
}

/**
 * 아키텍처 패턴 (Composition):
 * 1. SearchResultDisplay: 공통 로직 (로딩, 데이터 상태)
 * 2. QnASearchResult: 클릭 처리 정의 (라우팅)
 * 3. 부모(LibrarySideBar): 검색 UI 관리
 *
 * 컴포넌트를 재사용하기 위해 Link가 아닌 navigate 사용
 */
const QnASearchResult = ({
  keyword,
  data,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  className,
}: QnASearchResultProps) => {
  const navigate = useNavigate();

  const toScrapItem = (qna: QnAsSearchResponse): ScrapItem => ({
    id: qna.qnAId,
    companyName: qna.companyName,
    jobPosition: qna.jobPosition,
    applySeason: qna.applySeason ?? '',
    question: qna.question,
    answer: qna.answer ?? '',
    coverLetterId: qna.coverLetterId,
  });

  return (
    <SearchResultDisplay
      keyword={keyword}
      data={data}
      isLoading={isLoading}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      className={className}
      renderLibraryItem={(libName) => (
        <button
          type='button'
          onClick={() =>
            navigate(`/library/qna/${encodeURIComponent(libName)}`)
          }
          aria-label={`${libName} 폴더 열기`}
          className='inline-flex w-28 shrink-0 flex-col items-center justify-center gap-2.5 rounded-lg px-3 pt-5 pb-4 transition-colors hover:bg-gray-50'
        >
          <div className='relative flex flex-col items-center'>
            <SI.LibraryFolder />
          </div>
          <div className='line-clamp-1 w-24 text-center text-xs leading-5 font-medium text-gray-900'>
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
