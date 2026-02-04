import RightArrow from '@/features/home/components/icons/RightArrow';

interface UpcomingScheduleProps {
  date: string;
  dDay: number;
  schedules: Array<{
    company: string;
    position: string;
  }>;
}

const UpcomingSchedule = ({ date, dDay, schedules }: UpcomingScheduleProps) => {
  const isUrgent = dDay <= 3;

  return (
    <div className='w-72 h-52 flex-shrink-0 p-4 rounded-2xl outline outline-1 outline-offset-[-1px] outline-purple-100 inline-flex flex-col justify-start items-start gap-2.5'>
      <div className='self-stretch pl-1.5 inline-flex justify-between items-center'>
        <div
          className={`justify-start text-xl font-bold leading-8 line-clamp-1 ${
            isUrgent ? 'text-purple-600' : 'text-gray-700'
          }`}
        >
          {date}
        </div>
        <div
          className={`px-3 py-1.5 rounded-xl flex justify-center items-center gap-1 ${
            isUrgent ? 'bg-purple-50' : 'bg-gray-50'
          }`}
        >
          <div
            className={`justify-start text-xs font-medium leading-4 ${
              isUrgent ? 'text-purple-500' : 'text-gray-400'
            }`}
          >
            D-{dDay}
          </div>
        </div>
      </div>
      <div className='self-stretch px-1.5 flex flex-col justify-start items-start gap-2'>
        {schedules.map((schedule, index) => (
          <div
            key={index}
            className='self-stretch py-0.5 inline-flex justify-start items-center gap-3.5'
          >
            <div
              className={`w-2 h-14 rounded-[3px] ${
                isUrgent ? 'bg-purple-100' : 'bg-gray-100'
              }`}
            />
            <div className='flex-1 h-11 inline-flex flex-col justify-center items-start'>
              <div className='justify-start text-gray-700 text-base font-bold leading-6 line-clamp-1'>
                {schedule.company}
              </div>
              <div className='self-stretch justify-start text-gray-400 text-xs font-medium leading-5 line-clamp-1'>
                {schedule.position}
              </div>
            </div>
            <RightArrow size='sm' />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingSchedule;
