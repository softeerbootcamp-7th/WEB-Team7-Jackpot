import { PaginationIcon } from '@/shared/icons/PaginationIcons';
import { addMonths, formatYearMonth, subMonths } from '@/shared/utils/dates';

interface Props {
  day: Date;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
}

const CalendarHeader = ({ day, handlePrevMonth, handleNextMonth }: Props) => {
  const prevMonthText = formatYearMonth(subMonths(day, 1));
  const currentMonthText = formatYearMonth(day);
  const nextMonthText = formatYearMonth(addMonths(day, 1));

  return (
    <div>
      <div className='flex items-center justify-start gap-1'>
        <div className='text-title-s justify-start text-center font-medium text-gray-300'>
          {prevMonthText}
        </div>
      </div>
      <div className='flex items-center justify-start gap-5'>
        <button type='button' onClick={handlePrevMonth}>
          <PaginationIcon size={36} direction='left' />
        </button>
        <div className='flex items-center justify-start gap-1'>
          <div className='text-headline-s justify-start text-center font-bold text-gray-950'>
            {currentMonthText}
          </div>
        </div>
        <button type='button' onClick={handleNextMonth}>
          <PaginationIcon size={36} direction='right' />
        </button>
      </div>
      <div className='flex items-center justify-start gap-1'>
        <div className='text-title-s justify-start text-center font-medium text-gray-300'>
          {nextMonthText}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
