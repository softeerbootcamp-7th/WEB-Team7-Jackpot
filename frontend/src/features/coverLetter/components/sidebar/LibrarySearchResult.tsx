import LibraryQnAList from '@/features/coverLetter/components/sidebar/LibraryQnAList';
import SidebarSelectableList from '@/features/coverLetter/components/sidebar/SidebarSelectableList';
import type { ScrapItem } from '@/features/coverLetter/types/coverLetter';
import type {
  QnASearchResponse,
  QnAsSearchResponse,
} from '@/features/library/types';
import SearchResultDisplay from '@/shared/components/SearchResultDisplay';
import SidebarCard from '@/shared/components/sidebar/SidebarCard';
import * as SI from '@/shared/icons';

interface LibrarySearchResultProps {
  keyword: string;
  data: QnASearchResponse | null;
  isLoading: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  className?: string;
  selectedItem: ScrapItem | null;
  selectedLibrary: string | null;
  onSelectItem: (item: ScrapItem) => void;
  onSelectLibrary: (libraryName: string) => void;
  onBackToLibraryList: () => void;
  onBackToSearchResult: () => void;
  onQnASelect?: (qna: QnAsSearchResponse) => void;
}

/**
 * LibrarySearchResult 컴포넌트
 *
 * 역할: WriteSidebar에서 검색 결과를 표시하는 컴포넌트
 * - SearchResultDisplay를 감싸서 콜백 기반의 이벤트 처리 제공
 * - 폴더 선택 시 LibraryQnAList로 전환
 * - 개별 문항 선택 시 SidebarCardDetail로 전환
 *
 * 상태 흐름:
 * 1. selectedLibrary가 있으면 → LibraryQnAList 표시
 * 2. selectedItem이 있으면 (selectedLibrary 유지) → SidebarCardDetail 표시
 * 3. 둘 다 없으면 → 검색 결과 표시
 *
 * 네비게이션:
 * - 폴더 클릭 → onSelectLibrary
 * - 폴더 내 문항 클릭 → onSelectItem (selectedLibrary 유지)
 * - 뒤로가기 → onBackToSearchResult (둘 다 초기화)
 */
const LibrarySearchResult = ({
  keyword,
  data,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  className,
  selectedItem,
  selectedLibrary,
  onSelectItem,
  onSelectLibrary,
  onBackToLibraryList,
  onBackToSearchResult,
  onQnASelect,
}: LibrarySearchResultProps) => {
  const toScrapItem = (qna: QnAsSearchResponse): ScrapItem => ({
    id: qna.qnAId,
    companyName: qna.companyName,
    jobPosition: qna.jobPosition,
    applySeason: qna.applySeason ?? '',
    question: qna.question,
    answer: qna.answer ?? '',
    coverLetterId: qna.coverLetterId,
  });

  // 폴더 선택 → 폴더 내 문항 리스트 표시
  if (selectedLibrary) {
    return (
      <LibraryQnAList
        libraryName={selectedLibrary}
        selectedItem={selectedItem}
        onSelectItem={onSelectItem}
        onBackToLibraryList={onBackToLibraryList}
        onBack={onBackToSearchResult}
      />
    );
  }

  // 검색 결과 표시
  return (
    <SidebarSelectableList
      renderList={(onSelect) => (
        <SearchResultDisplay
          keyword={keyword}
          data={data}
          isLoading={isLoading}
          className={className}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          renderLibraryItem={(libName) => (
            <button
              type='button'
              onClick={() => onSelectLibrary(libName)}
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
              deleteScrap={() => {}}
              showDelete={false}
              onClick={() => {
                onSelect(toScrapItem(qna));
                onQnASelect?.(qna);
              }}
            />
          )}
        />
      )}
    />
  );
};

export default LibrarySearchResult;
