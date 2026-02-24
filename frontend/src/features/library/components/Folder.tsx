import { NavLink } from 'react-router';

import libraryFolder from '@/assets/icons/LibraryFolder.svg';
import { SITE_MAP } from '@/features/library/constants';
import { useLibraryTabs } from '@/features/library/hooks/useLibraryTabs';

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
      <img
        src={libraryFolder}
        alt='폴더 아이콘'
        className='h-[54px] w-[77.76px]'
      />
      <div className='text-caption-l line-clamp-1 w-24 justify-start text-center font-medium text-gray-950'>
        {name}
      </div>
    </NavLink>
  );
};

export default Folder;
