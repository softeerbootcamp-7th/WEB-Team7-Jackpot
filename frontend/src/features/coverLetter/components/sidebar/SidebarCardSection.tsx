import { Suspense } from 'react';

import ScrapList from '@/features/coverLetter/components/sidebar/ScrapList';
import SidebarSelectableList from '@/features/coverLetter/components/sidebar/SidebarSelectableList';
import { SidebarSkeleton } from '@/shared/components/SidebarSkeleton';

const SidebarCardSection = ({ searchWord }: { searchWord: string }) => {
  return (
    <SidebarSelectableList
      renderList={(onSelect) => (
        <Suspense key={searchWord} fallback={<SidebarSkeleton len={5} />}>
          <ScrapList searchWord={searchWord} onSelect={onSelect} />
        </Suspense>
      )}
    />
  );
};

export default SidebarCardSection;
