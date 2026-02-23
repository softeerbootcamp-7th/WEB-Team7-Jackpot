import CoverLetterItem from '@/features/upload/components/CoverLetterItem';
import { TAB_DATA } from '@/features/upload/constants/uploadPage';

interface CoverLetterListProps {
  tabState: number;
  setTabState: (newValue: number) => void;
  tabLength: number;
}

const CoverLetterList = ({
  tabState,
  setTabState,
  tabLength,
}: CoverLetterListProps) => {
  return (
    <div className='text-[1.125rem]'>
      {TAB_DATA.slice(0, tabLength).map((data) => (
        <CoverLetterItem
          key={data.tabNumber}
          targetTab={tabState}
          tabName={data.tabName}
          tabNumber={data.tabNumber}
          onClick={() => setTabState(data.tabNumber)}
        />
      ))}
    </div>
  );
};

export default CoverLetterList;
