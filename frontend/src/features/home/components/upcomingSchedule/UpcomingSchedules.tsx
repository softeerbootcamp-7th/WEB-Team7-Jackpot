import { Link } from 'react-router';

import EmptyState from '@/features/home/components/EmptyState';
import UpcomingSchedule from '@/features/home/components/upcomingSchedule/UpcomingSchedule';
import {
  EMPTY_SCHEDULE_DESCRIPTION,
  EMPTY_SCHEDULE_TITLE,
  UPCOMING_SCHEDULES_ARIA_LABEL,
  UPCOMING_SCHEDULES_TITLE,
} from '@/features/home/constants';
import { useUpcomingSchedules } from '@/features/home/hooks/useUpcomingSchedules';
import * as HI from '@/features/home/icons';
import * as SI from '@/shared/icons';

const UpcomingSchedules = () => {
  // 훅에서 가공된 데이터와 상태만 가져옴
  const { schedules, isEmpty } = useUpcomingSchedules();

  return (
    <div className='inline-flex flex-1 flex-col items-start justify-start gap-6'>
      {/* 헤더 영역 */}
      <div className='inline-flex w-full items-center justify-between'>
        <div className='flex items-center justify-start gap-2.5'>
          <div className='relative h-7 w-7'>
            <HI.AlarmIcon />
          </div>
          <h2 className='justify-start text-xl leading-9 font-bold text-gray-950'>
            {UPCOMING_SCHEDULES_TITLE}
          </h2>
        </div>
        <Link to={'/recruit'} aria-label={UPCOMING_SCHEDULES_ARIA_LABEL}>
          <SI.RightArrow size='lg' aria-hidden='true' />
        </Link>
      </div>

      {/* 컨텐츠 영역 */}
      {!isEmpty ? (
        <div className='inline-flex w-full items-center justify-start gap-3 overflow-x-auto'>
          {schedules.map(({ id, dateText, dDay, companyList }) => (
            <UpcomingSchedule
              key={id}
              date={dateText}
              dDay={dDay}
              schedules={companyList}
            />
          ))}
        </div>
      ) : (
        <div className='h-52 w-full'>
          <EmptyState
            title={EMPTY_SCHEDULE_TITLE}
            description={EMPTY_SCHEDULE_DESCRIPTION}
            to='/recruit'
          />
        </div>
      )}
    </div>
  );
};

export default UpcomingSchedules;
