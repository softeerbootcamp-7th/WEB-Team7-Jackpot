import { useCallback, useMemo, useState } from 'react';

import type { useSearchParams } from 'react-router';

import type { QnA } from '@/shared/types/qna';

interface UseCoverLetterPaginationPropsWithQnas {
  qnas: QnA[];
  searchParams: ReturnType<typeof useSearchParams>[0];
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}

type UseCoverLetterPaginationProps =
  | UseCoverLetterPaginationPropsWithQnas
  | number;

const useCoverLetterPagination = (props: UseCoverLetterPaginationProps) => {
  // 숫자로 전달된 경우 (단순 길이만 전달)
  const isSimpleMode = typeof props === 'number';
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const config = useMemo(() => {
    if (isSimpleMode) {
      return {
        isSimpleMode: true,
        totalPages: props,
        qnas: [],
        searchParams: null,
        setSearchParams: null,
      };
    }

    const { qnas, searchParams, setSearchParams } = props;
    const qnAIdParam = searchParams.get('qnAId');
    const qnAIdNum = qnAIdParam ? Number(qnAIdParam) : null;
    const qnAIdIndex = qnAIdNum
      ? qnas.findIndex((q) => q.qnAId === qnAIdNum)
      : 0;
    const safePageIndexValue = qnAIdIndex >= 0 ? qnAIdIndex : 0;

    return {
      isSimpleMode: false,
      totalPages: qnas.length,
      qnas,
      searchParams,
      setSearchParams,
      safePageIndex: safePageIndexValue,
    };
  }, [isSimpleMode, props]);

  const safePageIndex = isSimpleMode
    ? Math.min(currentPageIndex, (props as number) - 1)
    : config.safePageIndex || 0;

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (index: number) => {
      if (isSimpleMode) {
        const totalPages = props as number;
        const nextIndex = Math.max(0, Math.min(index, totalPages - 1));
        setCurrentPageIndex(nextIndex);
      } else {
        const nextIndex = Math.max(0, Math.min(index, config.totalPages - 1));
        const nextQnAId = config.qnas[nextIndex]?.qnAId;

        if (nextQnAId && config.setSearchParams) {
          config.setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.set('qnAId', String(nextQnAId));
              return next;
            },
            { replace: true },
          );
        }
      }
    },
    [isSimpleMode, props, config],
  );

  return { safePageIndex, handlePageChange, setCurrentPageIndex };
};

export default useCoverLetterPagination;
