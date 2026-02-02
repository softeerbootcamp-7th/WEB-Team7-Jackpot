interface TabButtonProps {
  isActived: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton = ({ isActived, onClick, icon, label }: TabButtonProps) => {
  return (
    <button
      className={`flex items-center gap-[0.375rem] px-[1.125rem] py-3 ${isActived ? 'text-purple-600 bg-purple-50' : 'text-gray-600 bg-white'} rounded-lg cursor-pointer`}
      onClick={onClick}
    >
      {isActived ? icon : null}
      <div className='font-bold'>{label}</div>
    </button>
  );
};

export default TabButton;
