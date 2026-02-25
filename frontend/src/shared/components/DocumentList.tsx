import { type ReactNode, useCallback, useRef } from 'react';

import SidebarSkeleton from '@/shared/components/SidebarSkeleton';
import useInfiniteScroll from '@/shared/hooks/useInfiniteScroll';

interface Props<T> {
  subHeading?: ReactNode;
  className?: string;
  items: T[];
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  emptyComponent?: ReactNode;
  renderItem: (item: T) => ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

const DocumentList = <T,>({
  className = '',
  items,
  isLoading = false,
  isError = false,
  emptyMessage = '데이터가 없습니다.',
  emptyComponent,
  subHeading,
  renderItem,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Props<T>) => {
  // 1. 투명한 감시자(Sentinel) 역할을 할 DOM 엘리먼트를 가리킬 Ref 생성
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 2. 무한 스크롤 훅 연결 (감시자가 화면에 보이면 onLoadMore 실행)
  const handleLoadMore = useCallback(() => {
    if (onLoadMore) onLoadMore();
  }, [onLoadMore]);

  useInfiniteScroll({
    sentinelRef,
    fetchNextPage: handleLoadMore,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage: !!isFetchingNextPage,
  });

  if (isLoading && items.length === 0) {
    return <SidebarSkeleton len={5} />;
  }

  if (isError && items.length === 0) {
    return (
      <div className='flex h-40 w-full items-center justify-center text-red-500'>
        데이터를 불러오는 중 문제가 발생했습니다.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`flex w-full flex-col ${className}`}>
        {emptyComponent ? (
          emptyComponent
        ) : (
          <div className='flex h-40 w-full items-center justify-center text-sm text-gray-400'>
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex w-full flex-col ${className}`}>
      {subHeading && <>{subHeading}</>}
      {/* 기존 리스트 렌더링 */}
      {items.map((item) => renderItem(item))}

      {/* 3. 더 보기 버튼 대신, 화면 바닥을 감지할 Sentinel div 배치 */}
      {hasNextPage && onLoadMore && (
        <div
          ref={sentinelRef} // 훅이 이 div를 관찰함
          className='mt-2 flex h-14 w-full items-center justify-center text-sm font-medium text-gray-500'
        >
          {/* 데이터를 불러오는 동안만 텍스트를 보여줌 */}
          {isFetchingNextPage ? <SidebarSkeleton len={1} /> : ''}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
