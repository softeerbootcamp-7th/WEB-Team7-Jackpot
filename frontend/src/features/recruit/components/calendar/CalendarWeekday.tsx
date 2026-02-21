import { WEEK_LIST } from '@/shared/constants/dates';

const CalendarWeekday = () => {
  return (
    <>
      {WEEK_LIST.map((d) => (
        <div
          key={d}
          className='flex flex-1 items-end justify-center gap-2.5 px-3 py-1.5'
        >
          <div
            className={`text-title-s justify-center text-center font-medium ${d === '일' ? 'text-red-600' : 'text-gray-600'} `}
          >
            {d}
          </div>
        </div>
      ))}
    </>
  );
};

export default CalendarWeekday;
