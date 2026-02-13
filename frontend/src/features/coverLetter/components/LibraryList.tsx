import { useRef } from 'react';

import Card from '@/features/coverLetter/components/Card';
import { useInfiniteCoverLetterSearch } from '@/features/coverLetter/hooks/useCoverLetterQueries';
import type { ScrapItem } from '@/features/coverLetter/types/coverLetter';
import { SidebarSkeleton } from '@/shared/components/SidebarSkeleton';
import useInfiniteScroll from '@/shared/hooks/useInfiniteScroll';
import type { RecentCoverLetter } from '@/shared/types/coverLetter';

interface LibraryListProps {
  searchWord: string;
  onSelect: (item: ScrapItem) => void;
}

const LibraryList = ({ searchWord, onSelect }: LibraryListProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteCoverLetterSearch(searchWord);

  useInfiniteScroll({
    sentinelRef,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const items = data?.pages?.flatMap((page) => page.coverLetters) ?? [];

  const handleLibraryClick = (letter: RecentCoverLetter) => {
    const mappedData: ScrapItem = {
      questionId: letter.coverLetterId,
      companyName: letter.companyName,
      jobPosition: letter.jobPosition,
      applySeason: `${letter.applyYear} ${letter.applyHalf === 'FIRST_HALF' ? '상반기' : '하반기'}`,
      question:
        '문항 목록을 불러오는 중이거나, 전체 자기소개서 보기 모드입니다.',
      answer: `이 자기소개서는 총 ${letter.questionCount}개의 문항으로 구성되어 있습니다.`,
    };
    onSelect(mappedData);
  };

  if (items.length === 0) {
    return (
      <div className='flex w-full items-center justify-center py-10 text-gray-400'>
        자기소개서 검색 결과가 없어요.
      </div>
    );
  }

  return (
    <>
      {items.map((item) => (
        <Card
          key={`lib-${item.coverLetterId}`}
          item={item}
          isScrap={false}
          deleteScrap={() => {}}
          onClick={() => handleLibraryClick(item)}
        />
      ))}
      {isFetchingNextPage && <SidebarSkeleton len={3} />}
      {hasNextPage && <div ref={sentinelRef} className='h-1' />}
    </>
  );
};

export default LibraryList;
