import { Link } from 'react-router';

import type { TabContentType } from '@/shared/types/tab';

interface TabProps<T> {
  currentTab: T;
  content: TabContentType<T>;
}

const TabItem = <T extends string>({ currentTab, content }: TabProps<T>) => {
  const { name, label, icon, path } = content;
  const isActive = currentTab === name;

  return (
    <Link
      to={path}
      className={`flex h-13 items-center justify-start rounded-lg py-3 ${
        isActive ? 'min-w-[180px] bg-purple-50 pr-5 pl-4' : 'min-w-39 px-5'
      }`}
    >
      {isActive ? (
        <div className='inline-flex items-center justify-center gap-1.5'>
          <div className='h-6 w-6'>{icon}</div>
          <div className='text-title-s justify-start font-bold text-purple-600'>
            {label}
          </div>
        </div>
      ) : (
        <div className='text-title-s justify-start font-normal text-gray-600'>
          {label}
        </div>
      )}
    </Link>
  );
};

export default TabItem;
