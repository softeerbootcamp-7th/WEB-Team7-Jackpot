import RightArrow from '../../../shared/icons/RightArrow';

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
    <div className='inline-flex h-52 w-72 flex-shrink-0 flex-col items-start justify-start gap-2.5 rounded-2xl p-4 outline outline-1 outline-offset-[-1px] outline-purple-100'>
      <div className='inline-flex items-center justify-between self-stretch pl-1.5'>
        <div
          className={`line-clamp-1 justify-start text-xl leading-8 font-bold ${
            isUrgent ? 'text-purple-600' : 'text-gray-700'
          }`}
        >
          {date}
        </div>
        <div
          className={`flex items-center justify-center gap-1 rounded-xl px-3 py-1.5 ${
            isUrgent ? 'bg-purple-50' : 'bg-gray-50'
          }`}
        >
          <div
            className={`justify-start text-xs leading-4 font-medium ${
              isUrgent ? 'text-purple-500' : 'text-gray-400'
            }`}
          >
            D-{dDay}
          </div>
        </div>
      </div>
      <div className='flex flex-col items-start justify-start gap-2 self-stretch px-1.5'>
        {schedules.map((schedule, index) => (
          <div
            key={index}
            className='inline-flex items-center justify-start gap-3.5 self-stretch py-0.5'
          >
            <div
              className={`h-14 w-2 rounded-[3px] ${
                isUrgent ? 'bg-purple-100' : 'bg-gray-100'
              }`}
            />
            <div className='inline-flex h-11 flex-1 flex-col items-start justify-center'>
              <div className='line-clamp-1 justify-start text-base leading-6 font-bold text-gray-700'>
                {schedule.company}
              </div>
              <div className='line-clamp-1 justify-start self-stretch text-xs leading-5 font-medium text-gray-400'>
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
