import AlarmIcon from '@/features/home/components/icons/AlarmClockIcon';
import RightArrow from '@/features/home/components/icons/RightArrow';
import UpcomingSchedule from '@/features/home/components/UpcomingSchedule';

const UpcomingSchedules = () => {
  return (
    <div className='inline-flex w-full flex-1 flex-col items-start justify-start gap-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center justify-start gap-2.5'>
          <div className='relative h-7 w-7'>
            <AlarmIcon />
          </div>
          <div className='text-title-l justify-start font-bold text-gray-950'>
            다가오는 일정
          </div>
        </div>
        <RightArrow size='lg' />
      </div>
      <div className='inline-flex w-full items-center justify-start gap-3 overflow-x-auto'>
        <UpcomingSchedule
          date='23일'
          dDay={3}
          schedules={[
            { company: '현대자동차', position: 'UI 디자인' },
            { company: '토스', position: '프로덕트 디자이너' },
          ]}
        />
        <UpcomingSchedule
          date='23일'
          dDay={11}
          schedules={[
            { company: '현대자동차', position: 'UI 디자인' },
            { company: '토스', position: '프로덕트 디자이너' },
          ]}
        />
        <UpcomingSchedule
          date='23일'
          dDay={11}
          schedules={[
            { company: '현대자동차', position: 'UI 디자인' },
            { company: '토스', position: '프로덕트 디자이너' },
          ]}
        />
      </div>
    </div>
  );
};

export default UpcomingSchedules;
