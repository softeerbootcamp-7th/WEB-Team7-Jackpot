import type { TabContentType } from '../types/tab';
import TabItem from './TabItem';

interface TabBarProps<T> {
  content: TabContentType<T>[];
  currentTab: T;
  handleTabChange: (tab: T) => void;
}

function TabBar<T extends string>({
  content,
  currentTab,
  handleTabChange,
}: TabBarProps<T>) {
  return (
    <nav className='flex items-center justify-start pt-7.5'>
      {content.map((tab) => (
        <div key={tab.name} className='flex items-center justify-start'>
          <TabItem
            currentTab={currentTab}
            handleTabChange={handleTabChange}
            content={tab}
          />
        </div>
      ))}
    </nav>
  );
}

export default TabBar;
