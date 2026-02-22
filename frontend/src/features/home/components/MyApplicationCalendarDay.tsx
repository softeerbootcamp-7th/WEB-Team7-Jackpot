import { Link } from 'react-router';

import type { MyApplicationCalendarDayInfo } from '@/features/home/types/home';
import { getLinkDate } from '@/shared/utils/dates';

interface Props {
  dayInfo: MyApplicationCalendarDayInfo;
}

const MyApplicationCalendarDay = ({ dayInfo }: Props) => {
  const isWeekend = dayInfo.dayOfWeek === 0 || dayInfo.dayOfWeek === 6;
  const dayColor = isWeekend
    ? dayInfo.dayOfWeek === 0
      ? 'text-red-600'
      : 'text-blue-500'
    : 'text-gray-950';

  const date = getLinkDate(dayInfo.dateString);

  return (
    <Link
      aria-label={`${dayInfo.dateString} 지원 일정 보기`}
      to={`/recruit/${date}`}
      className={`relative inline-flex h-12 w-12 flex-col items-center justify-center gap-1.5 rounded-lg px-4 py-1 transition-colors hover:bg-gray-100 ${
        dayInfo.isToday ? 'bg-purple-50 hover:bg-purple-100' : ''
      }`}
    >
      <span
        className={`text-center text-xl ${
          dayInfo.isToday
            ? 'font-semibold text-purple-500'
            : `font-normal ${dayColor}`
        } ${dayInfo.isPast ? 'opacity-40' : ''}`}
      >
        {dayInfo.day}
      </span>

      <div
        className={`absolute bottom-1.5 h-[5px] w-[5px] rounded-full ${
          dayInfo.hasSchedule
            ? dayInfo.isPast
              ? 'bg-gray-950 opacity-40' // 과거 일정은 시각적으로 덜 띄게 처리
              : 'bg-purple-500'
            : 'bg-transparent' // 일정이 없을 때 투명하게 처리
        }`}
      />
    </Link>
  );
};

export default MyApplicationCalendarDay;
