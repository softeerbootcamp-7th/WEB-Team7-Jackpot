<<<<<<< HEAD
import MyApplicationCalendar from '@/features/home/components/MyApplicationCalendar';
import UpcomingSchedules from '@/features/home/components/UpcomingSchedules';

const ScheduleOverview = () => {
  return (
    <div className='w-[82.5rem] inline-flex justify-start items-center gap-16'>
=======
import MyApplicationCalendar from './MyApplicationCalendar';
import UpcomingSchedules from './UpcomingSchedules';

const ScheduleOverview = () => {
  return (
    <div className='inline-flex w-[82.5rem] items-center justify-start gap-16'>
>>>>>>> 8b8258a ([refactor] FSD Lite 버전으로 홈화면 및 공통 컴포넌트 이동 fb53153)
      <MyApplicationCalendar />
      <UpcomingSchedules />
    </div>
  );
};

export default ScheduleOverview;
