import UpcomingScheduleItem from '@/features/home/components/upcomingSchedule/UpcomingScheduleItem';
import { UPCOMING_SCHEDULES_URGENT_THRESHOLD } from '@/features/home/constants';

interface Props {
  date: string;
  dDay: number;
  schedules: {
    company: string;
    position: string;
    coverLetterId: number;
  }[];
}

const UpcomingSchedule = ({ date, dDay, schedules }: Props) => {
  const isUrgent = dDay <= UPCOMING_SCHEDULES_URGENT_THRESHOLD;

  // root 태그에 w-72
  return (
    <div className='inline-flex h-52 flex-1 flex-shrink-0 flex-col items-start justify-start gap-2.5 rounded-2xl p-4 outline outline-1 outline-offset-[-1px] outline-purple-100'>
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
      <div className='flex h-96 flex-col items-start justify-start gap-2 self-stretch px-1.5'>
        {schedules.map((schedule, index) => (
          <UpcomingScheduleItem
            key={index}
            isUrgent={isUrgent}
            companyName={schedule.company}
            position={schedule.position}
            coverLetterId={schedule.coverLetterId}
          />
        ))}
      </div>
    </div>
  );
};

export default UpcomingSchedule;
