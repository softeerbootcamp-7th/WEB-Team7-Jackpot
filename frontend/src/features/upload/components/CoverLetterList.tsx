import CoverLetterItem from '@/features/upload/components/CoverLetterItem';
import { TAB_DATA } from '@/features/upload/constants/uploadPage';

interface CoverLetterListProps {
  tabState: number;
  setTabState: (newValue: number) => void;
}

const CoverLetterList = ({ tabState, setTabState }: CoverLetterListProps) => {
  return (
    <div className='text-[1.125rem]'>
      {TAB_DATA.map((data) => (
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
