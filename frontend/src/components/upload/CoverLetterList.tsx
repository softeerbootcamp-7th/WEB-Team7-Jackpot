import CoverLetterItem from '@/components/upload/CoverLetterItem';

import { TAB_DATA } from '@/constants/constantsInUploadPage';
import type { CoverLetterListProps } from '@/types/upload';

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
