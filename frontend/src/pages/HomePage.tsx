
import ScheduleOverview from '@/features/home/components/ScheduleOverview';
import SummaryOverview from '@/features/home/components/SummaryOverview';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import RightArrow from '@/shared/icons/RightArrow';

const HomePage = () => {
  return (
    <div className='flex min-h-screen w-full min-w-[1700px] flex-col overflow-x-hidden overflow-y-auto'>
      <div className='flex flex-1 flex-col gap-10 px-[18.75rem] pb-[1.125rem]'>
        <img
          className='h-96 w-full rounded-2xl'
          src='/images/banner.png'
          alt='홈 화면 배너'
        />
        <SummaryOverview />
        <ScheduleOverview />
        <CoverLetterOverview button={<RightArrow />} len={6} />
      </div>
    </div>
  );
};

export default HomePage;
