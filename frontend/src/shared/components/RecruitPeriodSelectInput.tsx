import { RECRUIT_SEASON_LIST } from '@/shared/constants/recruitSeason';

interface RecruitPeriodSelectInputProps {
  label: string;
  yearValue: number;
  seasonValue: string;
  constantData?: number[];
  handleYearChange: (value: number) => void;
  handleSeasonChange: (value: string) => void;
  handleDropdown?: (isOpen: boolean) => void;
  isOpen?: boolean;
  dropdownDirection?: 'top' | 'bottom';
  icon?: React.ReactNode;
}

const RecruitPeriodSelectInput = ({
  label,
  yearValue,
  seasonValue,
  constantData = [],
  handleYearChange,
  handleSeasonChange,
  handleDropdown,
  isOpen,
  dropdownDirection = 'bottom',
  icon,
}: RecruitPeriodSelectInputProps) => {
  const hasDropdown = constantData.length > 0;

  return (
    <div className='flex flex-col gap-3'>
      <div className='text-lg font-bold'>
        {label} <span className='text-red-600'>*</span>
      </div>
      <div className='flex items-center gap-2'>
        <div className='relative inline-block'>
          <button
            type='button'
            className={`relative flex flex-1 items-center justify-between gap-6 bg-gray-50 px-5 py-[0.875rem] ${isOpen ? 'z-20' : 'z-0'} cursor-pointer rounded-lg`}
            onClick={() => handleDropdown?.(!isOpen)}
          >
            <div className='font-medium'>{yearValue}</div>
            {icon}
          </button>

          {hasDropdown && isOpen && (
            <>
              <div
                className='fixed inset-0 z-10 cursor-default'
                onClick={() => handleDropdown?.(false)}
              />
              <div
                className={`absolute z-20 mt-2 max-h-40 w-56 overflow-y-scroll rounded-lg bg-white shadow-lg select-none ${dropdownDirection === 'top' ? 'bottom-full mb-2' : 'mt-2'}`}
              >
                <div className='flex flex-col gap-1 p-1'>
                  {constantData &&
                    constantData.map((year) => (
                      <button
                        type='button'
                        onClick={() => {
                          handleYearChange(year);
                          handleDropdown?.(false);
                        }}
                        key={year}
                        className='w-full cursor-pointer rounded-md px-4 py-[0.875rem] text-left text-[0.813rem] font-medium text-gray-700 hover:bg-gray-50 hover:font-bold hover:text-gray-950 focus:bg-gray-100 focus:text-gray-900 focus:outline-hidden'
                      >
                        {year}
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
        <div className='flex flex-3 justify-between rounded-lg bg-gray-50 px-1 py-1'>
          {RECRUIT_SEASON_LIST.map((each) => (
            <div key={each.season} className='flex-grow'>
              <label className='cursor-pointer items-center select-none'>
                <input
                  type='radio'
                  className='peer sr-only'
                  checked={seasonValue === each.season}
                  onChange={() => handleSeasonChange(each.season)}
                />
                <div
                  className={`flex justify-center rounded-md ${seasonValue === each.season ? 'bg-white' : ''} px-8 py-[0.625rem]`}
                >
                  <span
                    className={`${seasonValue === each.season ? 'font-bold text-gray-950' : 'text-gray-400'}`}
                  >
                    {each.label}
                  </span>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruitPeriodSelectInput;
