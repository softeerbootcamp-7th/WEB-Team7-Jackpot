import { Suspense } from 'react';

import ScrapList from '@/features/coverLetter/components/sidebar/ScrapList';
import SidebarSelectableList from '@/features/coverLetter/components/sidebar/SidebarSelectableList';
import { SidebarSkeleton } from '@/shared/components/SidebarSkeleton';

const SidebarCardSection = ({
  searchWord,
  deleteScrap,
}: {
  searchWord: string;
  deleteScrap: (id: number) => void;
}) => {
  return (
    <SidebarSelectableList
      renderList={(onSelect) => (
        <Suspense fallback={<SidebarSkeleton len={5} />}>
          <ScrapList
            searchWord={searchWord}
            deleteScrap={deleteScrap}
            onSelect={onSelect}
          />
        </Suspense>
      )}
    />
  );
};

export default SidebarCardSection;
