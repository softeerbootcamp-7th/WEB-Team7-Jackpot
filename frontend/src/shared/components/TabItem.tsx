import type { TabContentType } from '../types/tab';

interface TabProps<T> {
  currentTab: T;
  handleTabChange: (tab: T) => void;
  content: TabContentType<T>;
}

const TabItem = <T extends string>({
  currentTab,
  handleTabChange,
  content,
}: TabProps<T>) => {
  const { name, label, icon } = content;

  return (
    <button
      onClick={() => handleTabChange && handleTabChange(name)}
      className={`flex h-13 items-center justify-start rounded-lg py-3 ${currentTab === name ? 'w-45 bg-purple-50 pr-5 pl-4' : 'w-39 px-5'} `}
    >
      {currentTab === name ? (
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
    </button>
  );
};

export default TabItem;
