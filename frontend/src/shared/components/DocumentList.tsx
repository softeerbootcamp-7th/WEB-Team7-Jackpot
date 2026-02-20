import { type ReactNode } from 'react';

interface Props<T> {
  className?: string;
  items: T[];
  isLoading?: boolean;
  isError?: boolean;

  // [개선 1] 단순 텍스트 메시지 or 커스텀 컴포넌트 둘 다 지원
  emptyMessage?: string;
  emptyComponent?: ReactNode;

  // [핵심] 각 아이템 렌더링 위임
  renderItem: (item: T) => ReactNode;

  // 무한 스크롤 관련 (Optional)
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
  renderItem,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Props<T>) => {
  // 1. 초기 로딩 중이면서 데이터가 아예 없을 때 (페이지 전체 로딩)
  if (isLoading && items.length === 0) {
    return (
      <div className='flex h-40 w-full items-center justify-center text-gray-500'>
        로딩 중...
      </div>
    );
  }

  // 2. 에러 발생 시
  if (isError && items.length === 0) {
    return (
      <div className='flex h-40 w-full items-center justify-center text-red-500'>
        데이터를 불러오는 중 문제가 발생했습니다.
      </div>
    );
  }

  // 3. 데이터가 0개일 때 (빈 화면 처리)
  if (items.length === 0) {
    return (
      <div className={`flex w-full flex-col ${className}`}>
        {/* emptyComponent가 있으면 그걸 우선 렌더링, 없으면 기본 메시지 */}
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

  // 4. 데이터 리스트 렌더링
  return (
    <div className={`flex w-full flex-col ${className}`}>
      {items.map((item) => renderItem(item))}

      {/* 더 보기 버튼 (데이터가 있을 때만 노출) */}
      {hasNextPage && onLoadMore && (
        <button
          type='button'
          onClick={onLoadMore}
          disabled={isFetchingNextPage}
          className='mt-2 flex w-full cursor-pointer items-center justify-center py-4 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
        </button>
      )}
    </div>
  );
};

export default DocumentList;
