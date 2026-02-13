import { Suspense, useState } from 'react';

import CardDetail from '@/features/coverLetter/components/CardDetail';
import LibraryList from '@/features/coverLetter/components/LibraryList';
import ScrapList from '@/features/coverLetter/components/ScrapList';
import type { ScrapItem } from '@/features/coverLetter/types/coverLetter';
import { SidebarSkeleton } from '@/shared/components/SidebarSkeleton';

const CardSection = ({
  searchWord,
  isScrap,
  deleteScrap,
}: {
  searchWord: string;
  isScrap: boolean;
  deleteScrap: (id: number) => void;
}) => {
  const [selectedItem, setSelectedItem] = useState<ScrapItem | null>(null);

  // 상세 내용이 선택되었다면 CardDetail 렌더링
  if (selectedItem) {
    return (
      <CardDetail scrap={selectedItem} onBack={() => setSelectedItem(null)} />
    );
  }

  return (
    <Suspense fallback={<SidebarSkeleton len={5} />}>
      {isScrap ? (
        <ScrapList
          searchWord={searchWord}
          deleteScrap={deleteScrap}
          onSelect={setSelectedItem}
        />
      ) : (
        <LibraryList searchWord={searchWord} onSelect={setSelectedItem} />
      )}
    </Suspense>
  );
};

export default CardSection;
