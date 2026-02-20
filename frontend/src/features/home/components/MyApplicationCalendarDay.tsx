interface MyApplicationCalendarDayProps {
  date: Date;
  isBeforeDay: boolean;
  hasApplication: boolean;
}

const MyApplicationCalendarDay = ({
  date,
  isBeforeDay,
  hasApplication,
}: MyApplicationCalendarDayProps) => {
  return (
    <div
      className={`inline-flex h-12 w-12 flex-col items-center justify-end gap-1.5 rounded-2xl px-4 py-1 ${isBeforeDay ? 'opacity-40' : ''}`}
    >
      <div className='h-5 w-6 justify-center text-center text-xl leading-4 font-normal text-gray-950'>
        {date.getDate()}
      </div>
      {hasApplication && (
        <div className='h-[5px] w-[5px] rounded-full bg-blue-500' />
      )}
    </div>
  );
};

export default MyApplicationCalendarDay;
