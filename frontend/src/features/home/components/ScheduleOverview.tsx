import MyApplicationCalendar from '@/features/home/components/MyApplicationCalendar';
import UpcomingSchedules from '@/features/home/components/UpcomingSchedules';

const ScheduleOverview = () => {
  return (
    <div className='w-[82.5rem] inline-flex justify-start items-center gap-16'>
      <MyApplicationCalendar />
      <UpcomingSchedules />
    </div>
  );
};

export default ScheduleOverview;
