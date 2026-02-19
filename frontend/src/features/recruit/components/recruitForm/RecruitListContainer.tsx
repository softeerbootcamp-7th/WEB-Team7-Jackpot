import { type ReactNode, useMemo } from 'react';

import { recruitEmptyText } from '@/features/recruit/constants';
import { useInfiniteCalendarDates } from '@/features/recruit/hooks/queries/useCalendarQuery';
import { RecruitIcons as I } from '@/features/recruit/icons';
import type { CalendarRequest } from '@/features/recruit/types';
import DocumentItem from '@/shared/components/DocumentItem';
import DocumentList from '@/shared/components/DocumentList';
import EmptyCase from '@/shared/components/EmptyCase';
import { mapApplyHalf } from '@/shared/utils/recruitSeason';

interface Props {
  dateParams: CalendarRequest;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  emptyComponent?: ReactNode; // 빈 화면 커스텀
}

const RecruitListContainer = ({ dateParams, onEdit, onDelete }: Props) => {
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
        <I.EditIcon />
      </button>
      <button
        type='button'
        className='cursor-pointer'
        onClick={() => onDelete?.(id)}
        aria-label='삭제'
      >
        <I.DeleteIcon />
      </button>
    </div>
  );

  return (
    <div className='flex h-full w-full flex-col'>
      <DocumentList
        items={formattedDocuments}
        isLoading={isLoading}
        isError={isError}
        emptyComponent={<EmptyCase {...recruitEmptyText} size='small' />} // [박소민] DocumentList에 넣을지 고민
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        // [핵심] renderItem을 통해 UI 결정
        renderItem={(doc) => {
          // [박소민] applyYear, applyHalf은 DocumentItem에서 applySeason으로 합쳐서 보여줍니다.
          const applySeason = `${doc.applyYear} ${mapApplyHalf(doc.applyHalf)}`;

          return (
            <DocumentItem
              hasLink={false} // 리스트 아이템 자체는 클릭 불가능하게 설정 (액션 버튼으로 이동 유도)
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
