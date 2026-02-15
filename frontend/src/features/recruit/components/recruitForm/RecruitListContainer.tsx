import { type ReactNode, useMemo } from 'react';

import { useInfiniteCalendarDates } from '@/features/recruit/hooks/queries/useCalendarQuery';
import { RecruitIcons as I } from '@/features/recruit/icons';
import type { CalendarRequest } from '@/features/recruit/types';
import DocumentList from '@/shared/components/DocumentList';
import { getDate } from '@/shared/utils/dates';
import { mapApplyHalf } from '@/shared/utils/recruitSeason';

interface Props {
  dateParams: CalendarRequest;
  onItemClick?: (id: number) => void;
  emptyComponent?: ReactNode;
  // [추가] 부모(Page)로부터 받을 수정/삭제 핸들러
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const RecruitListContainer = ({
  dateParams,
  onItemClick,
  emptyComponent,
  onEdit,
  onDelete,
}: Props) => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCalendarDates(dateParams);

  const formattedDocuments = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) =>
      page.coverLetters.map((item) => ({
        id: item.coverLetterId,
        companyName: item.companyName,
        jobPosition: item.jobPosition,
        title: `${item.applyYear}년 ${mapApplyHalf(item.applyHalf)}`,
        questionCount: item.questionCount,
        date: getDate(item.deadline) ?? '',
      })),
    );
  }, [data]);

  if (isLoading)
    return <div className='py-10 text-center text-gray-500'>로딩 중...</div>;
  if (isError)
    return (
      <div className='py-10 text-center text-red-500'>에러가 발생했습니다.</div>
    );

  if (formattedDocuments.length === 0 && emptyComponent) {
    return <>{emptyComponent}</>;
  }

  return (
    <div className='flex h-full w-full flex-col'>
      <DocumentList
        documents={formattedDocuments}
        onItemClick={onItemClick}
        emptyMessage='해당 기간에 마감되는 공고가 없습니다.'
        // [핵심] renderAction을 통해 버튼 주입
        renderAction={(doc) => (
          <div className='flex items-center gap-1'>
            <button
              className='relative h-5 w-5'
              onClick={(e) => {
                e.stopPropagation(); //부모의 클릭 이벤트(onItemClick) 방지
                onEdit?.(doc.id);
              }}
            >
              <I.EditIcon />
            </button>
            <button
              className='relative h-5 w-5'
              onClick={(e) => {
                e.stopPropagation(); // 이하동문
                onDelete?.(doc.id);
              }}
            >
              <I.DeleteIcon />
            </button>
          </div>
        )}
      />

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className='w-full cursor-pointer py-4 text-sm text-gray-400 hover:text-gray-600'
        >
          {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
        </button>
      )}
    </div>
  );
};

export default RecruitListContainer;
