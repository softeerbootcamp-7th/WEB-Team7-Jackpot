interface TabProps<T> {
  currentTab: T;
  handleTabChange: (tab: T) => void;
  label: string;
  value: T;
  icon?: React.ReactNode;
}

const TabItem = <T extends string>({
  currentTab,
  handleTabChange,
  label,
  value,
  icon,
}: TabProps<T>) => {
  return (
    <button
      onClick={() => handleTabChange && handleTabChange(value)}
      data-active={currentTab === value}
      className='tab-button'
    >
      {currentTab === value ? (
        <div className='inline-flex justify-center items-center gap-1.5'>
          <div className='w-6 h-6 relative'>{icon}</div>
          <div className='justify-start text-purple-600 text-lg font-bold leading-7'>
            {label}
          </div>
        </div>
      ) : (
        <div className='justify-start text-gray-600 text-lg font-normal leading-7'>
          {label}
        </div>
      )}
    </button>
  );
};

export default TabItem;
