import { useCallback } from 'react';

import type { useSearchParams } from 'react-router';

import type { QnA } from '@/shared/types/qna';

interface UseCoverLetterPaginationProps {
  qnas: QnA[];
  searchParams: ReturnType<typeof useSearchParams>[0];
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}

const useCoverLetterPagination = ({
  qnas,
  searchParams,
  setSearchParams,
}: UseCoverLetterPaginationProps) => {
  // URL의 qnAId 파라미터를 읽어서 올바른 인덱스 찾기
  const qnAIdParam = searchParams.get('qnAId');
  const qnAIdNum = qnAIdParam ? Number(qnAIdParam) : null;
  const qnAIdIndex = qnAIdNum ? qnas.findIndex((q) => q.qnAId === qnAIdNum) : 0;
  const safePageIndex = qnAIdIndex >= 0 ? qnAIdIndex : 0;

  // 페이지 변경 핸들러: index → qnAId로 URL 업데이트
  const handlePageChange = useCallback(
    (index: number) => {
      // 범위 체크: 0 ~ qnas.length - 1 사이로 제한
      const nextIndex = Math.max(0, Math.min(index, qnas.length - 1));
      const nextQnAId = qnas[nextIndex]?.qnAId;

      if (nextQnAId) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set('qnAId', String(nextQnAId));
            return next;
          },
          { replace: true },
        );
      }
    },
    [qnas, setSearchParams],
  );

  return { safePageIndex, handlePageChange };
};

export default useCoverLetterPagination;
