import ScheduleOverview from '@/features/home/components/ScheduleOverview';
import SummaryOverview from '@/features/home/components/SummaryOverview';
import CoverLetterOverview from '@/shared/components/CoverLetterOverview';
import PageGlobalHeader from '@/shared/components/PageGlobalHeader';
import RightArrow from '@/shared/icons/RightArrow';

// 박소민 px-75를 추가하여 일관된 콘텐츠가 보여지도록 구현하였습니다.

const HomePage = () => {
  return (
    <div className='flex h-screen w-full max-w-screen min-w-[1700px] flex-col overflow-x-hidden overflow-y-auto'>
      <div className='flex-shrink-0'>
        <PageGlobalHeader />
      </div>
      <div className='flex flex-1 flex-col gap-10 px-[18.75rem] pb-4.5'>
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
