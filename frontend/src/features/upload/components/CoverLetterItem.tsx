interface CoverLetterItemProps {
  targetTab: 1 | 2 | 3;
  tabName: string;
  tabNumber: 1 | 2 | 3;
  onClick: () => void;
}

const CoverLetterItem = ({
  targetTab,
  tabName,
  tabNumber,
  onClick,
}: CoverLetterItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 cursor-pointer rounded-lg ${tabNumber === targetTab ? 'bg-gray-50 font-bold text-gray-600' : 'text-gray-400'}`}
    >
      {tabName}
    </button>
  );
};

export default CoverLetterItem;
