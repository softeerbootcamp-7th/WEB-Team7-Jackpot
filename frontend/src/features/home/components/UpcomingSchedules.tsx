import AlarmIcon from '@/features/home/components/icons/AlarmClockIcon';
import RightArrow from '@/features/home/components/icons/RightArrow';
import UpcomingSchedule from '@/features/home/components/UpcomingSchedule';

const UpcomingSchedules = () => {
  return (
    <div className='flex-1 inline-flex flex-col justify-start items-start gap-6'>
      <div className='w-full inline-flex justify-between items-center'>
        <div className='flex justify-start items-center gap-2.5'>
          <div className='w-7 h-7 relative'>
            <AlarmIcon />
          </div>
          <div className='justify-start text-gray-950 text-xl font-bold leading-9'>
            다가오는 일정
          </div>
        </div>
        <RightArrow size='lg' />
      </div>
      <div className='w-full inline-flex justify-start items-center gap-3 overflow-x-auto'>
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
