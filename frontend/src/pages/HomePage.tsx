import CoverLetterOverview from '@/features/home/components/CoverLetterOverview';
import ScheduleOverview from '@/features/home/components/ScheduleOverview';
import SummaryOverview from '@/features/home/components/SummaryOverview';

const HomePage = () => {
  return (
    <div className='relative flex min-h-[1390px] w-full justify-center overflow-hidden bg-white'>
      <div className='relative m-auto flex h-[86.875rem] min-w-[120rem] flex-col items-center justify-center space-y-4'>
        <img
          className='h-96 w-[82.5rem] rounded-2xl'
          src='/images/banner.png'
          alt='홈 화면 배너'
        />
        <SummaryOverview />
        <ScheduleOverview />
        <CoverLetterOverview />
      </div>
    </div>
  );
};

export default HomePage;
