import { Link } from 'react-router';

import MyApplicationCalendarDay from '@/features/home/components/MyApplicationCalendarDay';
import {
  MY_APPLICATION_CALENDAR_ARIA_LABEL,
  MY_APPLICATION_CALENDAR_TITLE,
} from '@/features/home/constants';
import { useMyApplicationCalendar } from '@/features/home/hooks/useMyApplicationCalendar';
import * as HI from '@/features/home/icons';
import { WEEK_LIST } from '@/shared/constants/dates';
import * as SI from '@/shared/icons';

const MyApplicationCalendar = () => {
  const { weeks } = useMyApplicationCalendar();

  return (
    <div className='inline-flex w-96 flex-col items-start justify-start gap-6'>
      {/* 헤더 영역 */}
      <Link
        to={'/recruit'}
        aria-label={MY_APPLICATION_CALENDAR_ARIA_LABEL}
        className='block w-full'
      >
        <div className='inline-flex w-full cursor-pointer items-center justify-between self-stretch rounded-lg p-2 transition-colors hover:bg-gray-100'>
          <div className='flex items-center justify-start gap-2.5'>
            <div className='h-7 w-7'>
              <HI.CalendarIcon />
            </div>
            <h2 className='text-xl leading-9 font-bold text-gray-950'>
              {MY_APPLICATION_CALENDAR_TITLE}
            </h2>
          </div>

          <SI.RightArrow size='lg' aria-hidden='true' />
        </div>
      </Link>
      {/* 캘린더 영역 */}
      <div className='flex w-full flex-col items-start justify-start gap-1 self-stretch'>
        {/* 요일 헤더 */}
        <div className='inline-flex items-center justify-between self-stretch'>
          {WEEK_LIST.map((day, index) => {
            const isSunday = index === 0;
            const isSaturday = index === 6;
            const textColor = isSunday
              ? 'text-red-600'
              : isSaturday
                ? 'text-blue-500'
                : 'text-gray-950';

            return (
              <div
                key={day}
                className='inline-flex h-12 w-12 flex-col items-center justify-center rounded-[125px] px-4 py-1'
              >
                <div
                  className={`h-5 w-6 justify-center text-center text-xl leading-4 font-normal ${textColor}`}
                >
                  {day}
                </div>
              </div>
            );
          })}
        </div>

        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className='inline-flex items-center justify-between self-stretch'
          >
            {week.map((dayInfo) => (
              <MyApplicationCalendarDay
                key={dayInfo.dateString}
                dayInfo={dayInfo}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyApplicationCalendar;
