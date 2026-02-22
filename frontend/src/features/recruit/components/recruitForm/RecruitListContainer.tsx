import { type ReactNode, useMemo } from 'react';

import { useInfiniteCalendarDates } from '@/features/recruit/hooks/queries/useCalendarQuery';
import { RecruitIcons as RCI } from '@/features/recruit/icons';
import type { CalendarRequest } from '@/features/recruit/types';
import DocumentItem from '@/shared/components/DocumentItem';
import DocumentList from '@/shared/components/DocumentList';
import { getDate } from '@/shared/utils/dates';
import { mapApplyHalf } from '@/shared/utils/recruitSeason';

interface Props {
  dateParams: CalendarRequest;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  emptyComponent?: ReactNode; // 빈 화면 커스텀
}

const RecruitListContainer = ({
  dateParams,
  onEdit,
  onDelete,
  emptyComponent,
}: Props) => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCalendarDates(dateParams);

  // 데이터 가공 로직
  const formattedDocuments = useMemo(() => {
    return (
      data?.pages.flatMap((page) =>
        page.coverLetters.map((item) => ({
          coverLetterId: item.coverLetterId,
          companyName: item.companyName,
          jobPosition: item.jobPosition,
          applyYear: item.applyYear,
          applyHalf: item.applyHalf,
          deadline: item.deadline,
          questionCount: item.questionCount,
        })),
      ) ?? []
    );
  }, [data]);

  // Action 버튼 렌더링 헬퍼 함수
  const renderActions = (id: number) => (
    <div className='flex items-center gap-3'>
      <button
        type='button'
        className='cursor-pointer'
        onClick={() => onEdit?.(id)}
        aria-label='수정'
      >
        <RCI.EditIcon />
      </button>
      <button
        type='button'
        className='cursor-pointer'
        onClick={() => onDelete?.(id)}
        aria-label='삭제'
      >
        <RCI.DeleteIcon />
      </button>
    </div>
  );

  const headerDate = getDate(formattedDocuments[0]?.deadline || '');
  const headerCount = formattedDocuments.length || 0;

  const subHeading = useMemo(
    () => (
      <div className='inline-flex items-center justify-between self-stretch'>
        <div className='flex items-center justify-start gap-2'>
          <div className='relative h-8 w-8 overflow-hidden'>
            <RCI.DateIcon />
          </div>
          <div className='justify-start text-xl leading-8 font-bold text-gray-950'>
            {headerDate}
          </div>
        </div>
        <div className='flex min-w-6 items-center justify-center gap-1 rounded-[10px] bg-gray-50 px-2 py-1'>
          <div className='flex-1 justify-start text-center text-xs leading-4 font-medium text-gray-500'>
            {headerCount}건
          </div>
        </div>
      </div>
    ),
    [headerDate, headerCount],
  );

  return (
    <div className='flex h-full w-full flex-col'>
      <DocumentList
        items={formattedDocuments}
        isLoading={isLoading}
        isError={isError}
        emptyComponent={emptyComponent}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        subHeading={subHeading}
        renderItem={(doc) => {
          const applySeason = `${doc.applyYear} ${mapApplyHalf(doc.applyHalf)}`;

          return (
            <DocumentItem
              hasLink={false}
              key={doc.coverLetterId}
              coverLetterId={doc.coverLetterId}
              companyName={doc.companyName}
              jobPosition={doc.jobPosition}
              applySeason={applySeason}
              deadline={doc.deadline}
              questionCount={doc.questionCount}
              rightAction={renderActions(doc.coverLetterId)}
            />
          );
        }}
      />
    </div>
  );
};

export default RecruitListContainer;
