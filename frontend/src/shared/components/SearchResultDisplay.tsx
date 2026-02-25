import { type ReactNode, useRef } from 'react';

import type {
  QnASearchResponse,
  QnAsSearchResponse,
} from '@/features/library/types';
import { SidebarSkeleton } from '@/shared/components/SidebarSkeleton';
import useInfiniteScroll from '@/shared/hooks/useInfiniteScroll';
import * as SI from '@/shared/icons';

interface SearchResultDisplayProps {
  keyword: string;
  data: QnASearchResponse | null;
  className?: string;
  renderLibraryItem: (libName: string) => ReactNode;
  renderQnAItem: (qna: QnAsSearchResponse) => ReactNode;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

/**
 * SearchResultDisplay 컴포넌트
 *
 * 역할: 검색 결과 표시의 공통 로직을 담당하는 컴포넌트
 *
 * 설계 원칙 (Render Props 패턴):
 * 1. "로직은 공통화, 렌더링은 유연하게"
 *    - 상태 관리, 조건부 렌더링은 이 컴포넌트에서 처리
 *    - 각 아이템의 클릭 처리는 부모에서 정의
 *
 * 2. "컴포넌트 합성의 강력함"
 *    - 같은 UI 로직을 여러 방식으로 재사용 가능
 *    - 라우팅, 콜백, 모달 등 자유롭게 조합 가능
 *
 * 3. "타입 안전성 유지"
 *    - children과 다르게 renderProp은 props로 타입 전달 가능
 *    - TypeScript의 제네릭 활용으로 타입 안전성 강화
 *
 * 사용 예시:
 * ```tsx
 * // 라우팅 버전 (QnASearchResult)
 * <SearchResultDisplay
 *   data={data}
 *   renderLibraryItem={(lib) => <NavLink to={...}>{lib}</NavLink>}
 *   renderQnAItem={(qna) => <NavLink to={...}>{qna.question}</NavLink>}
 * />
 *
 * // 콜백 버전 (LibrarySearchResult)
 * <SearchResultDisplay
 *   data={data}
 *   renderLibraryItem={(lib) => <button onClick={() => onSelect(lib)}>{lib}</button>}
 *   renderQnAItem={(qna) => <button onClick={() => onSelect(qna)}>{qna.question}</button>}
 * />
 * ```
 */
const SearchResultDisplay = ({
  keyword,
  data,
  className,
  renderLibraryItem,
  renderQnAItem,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: SearchResultDisplayProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useInfiniteScroll({
    sentinelRef,
    fetchNextPage: fetchNextPage ?? (() => {}),
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage: isFetchingNextPage ?? false,
  });

  // 검색어 없음
  if (!keyword) return null;

  // 데이터 없음
  if (!data || (data.libraryCount === 0 && data.qnACount === 0)) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 pt-20 text-gray-400'>
        <span>검색 결과가 없습니다.</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className ?? ''}`}>
      {/* 문항 유형 검색 결과 */}
      {data.libraries.length > 0 && (
        <div className='flex w-full flex-col items-start justify-start gap-3 border-b border-gray-100 pb-3'>
          <div className='inline-flex h-7 w-full items-center justify-start px-3'>
            <div className='flex items-center justify-start gap-2 pl-3'>
              <div className='relative h-6 w-6 overflow-hidden'>
                <div className='absolute top-0 left-0 h-6 w-6'>
                  <SI.FolderIcon />
                </div>
              </div>
              <div className='flex items-center justify-start gap-1'>
                <div className='text-base leading-6 font-bold text-gray-900'>
                  문항 유형 검색 결과
                </div>
                <div className='text-xs leading-5 font-bold text-gray-400'>
                  ·
                </div>
                <div className='text-xs leading-5 font-bold text-gray-400'>
                  {data.libraryCount}개
                </div>
              </div>
            </div>
          </div>

          <div className='flex w-full flex-col items-start justify-start'>
            <div className='scrollbar-hide inline-flex w-full items-center justify-start overflow-y-auto px-3'>
              {data.libraries.map((libName) => (
                <div key={libName}>{renderLibraryItem?.(libName)}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 단건 문항 검색 결과 */}
      {data.qnAs.length > 0 && (
        <div className='mt-4 flex w-full flex-col items-start justify-start gap-2'>
          <div className='inline-flex h-7 w-full items-center justify-start px-3'>
            <div className='flex items-center justify-start gap-2 pl-3'>
              <div className='relative h-6 w-6 overflow-hidden'>
                <SI.SearchResultIcon />
              </div>
              <div className='flex items-center justify-start gap-1'>
                <div className='text-base leading-6 font-bold text-gray-950'>
                  문항 검색 결과
                </div>
                <div className='text-xs leading-5 font-bold text-gray-400'>
                  ·
                </div>
                <div className='text-xs leading-5 font-bold text-gray-400'>
                  {data.qnACount}개
                </div>
              </div>
            </div>
          </div>

          <div className='flex w-full flex-col items-start justify-start'>
            {data.qnAs.map((qna) => (
              <div className='w-full' key={qna.qnAId}>
                {renderQnAItem(qna)}
              </div>
            ))}
            {isFetchingNextPage && <SidebarSkeleton len={3} />}
            {hasNextPage && <div ref={sentinelRef} className='h-1' />}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultDisplay;
