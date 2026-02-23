import { NavLink } from 'react-router';

import { SITE_MAP } from '@/features/library/constants';
import { useLibraryTabs } from '@/features/library/hooks/useLibraryTabs';
import * as SI from '@/shared/icons';
type FolderProps = {
  name: string;
};

const Folder = ({ name }: FolderProps) => {
  const { currentTab } = useLibraryTabs();

  const tab = SITE_MAP[currentTab];

  return (
    <NavLink
      to={`./${tab}/${encodeURIComponent(name)}`}
      className='inline-flex h-30 w-30 flex-col items-center justify-center gap-2.5 rounded-lg px-3 pt-5 pb-4 transition-colors hover:bg-gray-50'
    >
      <SI.LibraryFolder />
      <div className='text-caption-l line-clamp-1 w-24 justify-start text-center font-medium text-gray-950'>
        {name}
      </div>
    </NavLink>
  );
};

export default Folder;
