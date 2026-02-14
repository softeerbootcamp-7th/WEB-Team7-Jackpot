interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
}

const TabButton = ({ icon, label }: TabButtonProps) => {
  return (
    <button
      className={`flex items-center gap-[0.375rem] rounded-lg bg-purple-50 px-[1.125rem] py-3 text-purple-600`}
    >
      {icon}
      <div className='font-bold'>{label}</div>
    </button>
  );
};

export default TabButton;
