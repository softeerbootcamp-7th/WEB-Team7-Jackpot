import { useRef } from 'react';

import SidebarCard from '@/shared/components/sidebar/SidebarCard';
import { SidebarSkeleton } from '@/shared/components/SidebarSkeleton';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';
import { useScrapCoverLetters } from '@/shared/hooks/useCoverLetterQueries';
import useInfiniteScroll from '@/shared/hooks/useInfiniteScroll';
import { useDeleteScrapMutation } from '@/shared/hooks/useScrapQueries';
import type { ScrapItem } from '@/shared/types/coverLetter';

interface ScrapListProps {
  searchWord: string;
  onSelect: (item: ScrapItem) => void;
}

const ScrapList = ({ searchWord, onSelect }: ScrapListProps) => {
  const { showToast } = useToastMessageContext();

  // 삭제 API 훅 가져오기
  const { mutate: deleteScrapMutation } = useDeleteScrapMutation();

  // 스크랩 삭제 함수 구현
  const deleteScrap = (id: number) => {
    deleteScrapMutation(id, {
      onSuccess: () => {
        showToast('스크랩이 삭제되었습니다.', true);
      },
      onError: () => {
        showToast('처리에 실패했습니다. 다시 시도해주세요.', false);
      },
    });
  };

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
      {items.map((item) => (
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
