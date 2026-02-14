import { useCallback, useState } from 'react';

import Calendar from '@/features/recruit/components/calendar/Calendar';
import NewRecruitButton from '@/features/recruit/components/NewRecruitButton';
import RecruitFormContainer from '@/features/recruit/components/recruitform/RecruitFormContainer';
import { recruitHeaderText } from '@/features/recruit/constants';
import ContentHeader from '@/shared/components/ContentHeader';

const RecruitPage = () => {
  const [newRecruit, setNewRecruit] = useState(false);

  const handleNewRecruitButtonClick = useCallback(() => {
    setNewRecruit(true);
  }, []);

  return (
    <div className='flex h-[calc(100vh-5.625rem)] w-full max-w-screen min-w-[1700px] flex-col px-75 pb-30'>
      <div className='flex flex-row items-center justify-between'>
        <ContentHeader {...recruitHeaderText} />
        <NewRecruitButton onClick={handleNewRecruitButtonClick} />
      </div>
      <div className='flex flex-row items-center justify-between'>
        <Calendar />
        {newRecruit && (
          <RecruitFormContainer onClose={() => setNewRecruit(false)} />
        )}
      </div>
    </div>
  );
};

export default RecruitPage;
