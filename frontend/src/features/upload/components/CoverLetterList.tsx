import CoverLetterItem from '@/features/upload/components/CoverLetterItem';
import { TAB_DATA } from '@/features/upload/constants/uploadPage';
import type { CoverLetterTabProps } from '@/features/upload/types/upload';

const CoverLetterList = ({ tabState, setTabState }: CoverLetterTabProps) => {
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
