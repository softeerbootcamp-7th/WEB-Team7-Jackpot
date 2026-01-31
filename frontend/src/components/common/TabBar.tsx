import TabItem from './TabItem';

export interface TabContentType<T> {
  name: T;
  label: string;
  icon: React.ReactNode;
}

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
    <nav className='pt-7.5 flex justify-start items-center'>
      {content.map((tab) => (
        <div key={tab.name} className='flex justify-start items-center'>
          <TabItem
            currentTab={currentTab}
            handleTabChange={handleTabChange}
            label={tab.label}
            value={tab.name}
            icon={tab.icon}
          />
        </div>
      ))}
    </nav>
  );
}

export default TabBar;
