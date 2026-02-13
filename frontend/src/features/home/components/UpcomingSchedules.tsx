import { Link } from 'react-router';

import EmptyState from '@/features/home/components/EmptyState';
import UpcomingSchedule from '@/features/home/components/UpcomingSchedule';
import { useUpcomingDeadlines } from '@/features/home/hooks/useHomeQueries';
import AlarmIcon from '@/features/home/icons/AlarmClockIcon';
import RightArrow from '@/shared/icons/RightArrow';

const UpcomingSchedules = () => {
  const { data } = useUpcomingDeadlines(3, 2);

  const calculateDDay = (deadline: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  return (
    <div className='inline-flex flex-1 flex-col items-start justify-start gap-6'>
      <div className='inline-flex w-full items-center justify-between'>
        <div className='flex items-center justify-start gap-2.5'>
          <div className='relative h-7 w-7'>
            <AlarmIcon />
          </div>
          <div className='justify-start text-xl leading-9 font-bold text-gray-950'>
            다가오는 일정
          </div>
        </div>
        <button type='button' aria-label='다가오는 일정 더보기'>
          <RightArrow size='lg' aria-hidden='true' />
        </button>
      </div>
      {data.length > 0 ? (
        <Link
          to='/recruit'
          replace
          className='inline-flex w-full items-center justify-start gap-3 overflow-x-auto'
        >
          {data.map((item) => (
            <UpcomingSchedule
              key={item.deadline}
              date={formatDate(item.deadline)}
              dDay={calculateDDay(item.deadline)}
              schedules={item.coverLetters.map((cl) => ({
                company: cl.companyName,
                position: cl.jobPosition,
              }))}
            />
          ))}
        </Link>
      ) : (
        <div className='h-52 w-full'>
          <EmptyState
            title='새로운 일정 등록하기'
            description='아직 등록된 일정이 없어요.<br/>여기를 눌러 새로운 일정을 추가해보세요!'
            to='/recruit'
            replace
          />
        </div>
      )}
    </div>
  );
};

export default UpcomingSchedules;
