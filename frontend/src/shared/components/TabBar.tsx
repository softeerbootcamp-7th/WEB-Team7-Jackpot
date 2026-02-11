import TabItem from '@/shared/components/TabItem';
import type { TabContentType } from '@/shared/types/tab';

interface TabBarProps<T> {
  content: TabContentType<T>[];
  currentTab: T;
  handleTabChange: (tab: T) => void;
}

function TabBar<T extends string>({ content, currentTab }: TabBarProps<T>) {
  return (
    <nav className='mb-7.5 flex items-center justify-start'>
      {content.map((tab) => (
        <div key={tab.name} className='flex items-center justify-start'>
          <TabItem currentTab={currentTab} content={tab} />
        </div>
      ))}
    </nav>
  );
}

export default TabBar;
