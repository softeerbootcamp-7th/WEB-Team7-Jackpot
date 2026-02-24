import { type ReactNode, useState } from 'react';

import SidebarCardDetail from '@/features/coverLetter/components/sidebar/SidebarCardDetail';
import type { ScrapItem } from '@/features/coverLetter/types/coverLetter';

interface SidebarSelectableListProps {
  renderList: (onSelect: (item: ScrapItem) => void) => ReactNode;
  wrapperClassName?: string;
}

const SidebarSelectableList = ({
  renderList,
  wrapperClassName,
}: SidebarSelectableListProps) => {
  const [selectedItem, setSelectedItem] = useState<ScrapItem | null>(null);

  if (selectedItem) {
    return (
      <SidebarCardDetail
        scrap={selectedItem}
        onBack={() => setSelectedItem(null)}
      />
    );
  }

  const content = renderList(setSelectedItem);

  if (!wrapperClassName) {
    return <>{content}</>;
  }

  return <div className={wrapperClassName}>{content}</div>;
};

export default SidebarSelectableList;
