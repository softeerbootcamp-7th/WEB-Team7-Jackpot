import { useRef } from 'react';

import SidebarCard from '@/features/coverLetter/components/sidebar/SidebarCard';
import { useScrapCoverLetters } from '@/features/coverLetter/hooks/useCoverLetterQueries';
import type { ScrapItem } from '@/features/coverLetter/types/coverLetter';
import { SidebarSkeleton } from '@/shared/components/SidebarSkeleton';
import useInfiniteScroll from '@/shared/hooks/useInfiniteScroll';

interface ScrapListProps {
  searchWord: string;
  deleteScrap: (id: number) => void;
  onSelect: (item: ScrapItem) => void;
}

const ScrapList = ({ searchWord, deleteScrap, onSelect }: ScrapListProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useScrapCoverLetters(searchWord);

  useInfiniteScroll({
    sentinelRef,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const items = data?.pages?.flatMap((page) => page.scraps) ?? [];

  if (items.length === 0) {
    return (
      <div className='flex w-full items-center justify-center py-10 text-gray-400'>
        스크랩된 문항이 없어요.
      </div>
    );
  }

  return (
    <>
      {items.map((item, index) => (
        <SidebarCard
          key={`scrap-${item.id}`}
          item={item}
          isScrap={true}
          deleteScrap={deleteScrap}
          onClick={() => onSelect(item)}
        />
      ))}
      {isFetchingNextPage && <SidebarSkeleton len={3} />}
      {hasNextPage && <div ref={sentinelRef} className='h-1' />}
    </>
  );
};

export default ScrapList;
