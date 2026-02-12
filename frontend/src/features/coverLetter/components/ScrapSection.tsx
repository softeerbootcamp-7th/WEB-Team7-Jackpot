import { useEffect, useRef, useState } from 'react';

import Scrap from '@/features/coverLetter/components/Scrap';
import ScrapDetail from '@/features/coverLetter/components/ScrapDetail';
import { ScrapListSkeleton } from '@/features/coverLetter/components/ScrapSkeleton';
import { useScrapCoverLetters } from '@/features/coverLetter/hooks/useCoverLetterQueries';
import type { ScrapItem } from '@/features/coverLetter/types/coverLetter';

const ScrapSection = ({
  searchWord,
  deleteScrap,
}: {
  searchWord: string;
  deleteScrap: () => void;
}) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useScrapCoverLetters(searchWord);

  const [selectedScrap, setSelectedScrap] = useState<ScrapItem | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const scraps = data.pages.flatMap((page) => page.scraps);

  if (selectedScrap) {
    return (
      <ScrapDetail
        scrap={selectedScrap}
        onBack={() => setSelectedScrap(null)}
      />
    );
  }

  if (scraps.length === 0) {
    return (
      <div className='flex w-full items-center justify-center py-10 text-gray-400'>
        스크랩된 문항이 없어요.
      </div>
    );
  }

  return (
    <>
      {scraps.map((scrap) => (
        <Scrap
          key={scrap.questionId}
          scrap={scrap}
          deleteScrap={deleteScrap}
          onClick={() => setSelectedScrap(scrap)}
        />
      ))}
      {isFetchingNextPage && <ScrapListSkeleton len={3} />}
      {hasNextPage && <div ref={sentinelRef} className='h-1' />}
    </>
  );
};

export default ScrapSection;
