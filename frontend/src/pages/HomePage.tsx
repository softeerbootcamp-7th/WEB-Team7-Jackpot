import SummaryOverview from '@/components/home/SummaryOverview';
import CoverLetterOverview from '@/components/home/CoverLetterOverview';
import ScheduleOverview from '@/components/home/ScheduleOverview';

const HomePage = () => {
  return (
    <div className='w-full min-h-[1390px] relative bg-white overflow-hidden flex justify-center'>
      <div className='min-w-[120rem] h-[86.875rem] relative space-y-4 flex flex-col justify-center items-center m-auto'>
        <img
          className='w-[82.5rem] h-96 rounded-2xl'
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
