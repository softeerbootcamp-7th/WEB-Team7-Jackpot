import { useEffect } from 'react';

import { RECRUIT_SEASON_LIST } from '@/shared/constants/recruitSeason';
import type { ApiApplyHalf } from '@/shared/types/coverLetter';

interface RecruitPeriodSelectInputProps {
  label: string;
  nameYear: string;
  nameSeason: string;
  yearValue: number;
  seasonValue: ApiApplyHalf;
  onChangeYear: (year: number) => void;
  onChangeSeason: (season: ApiApplyHalf) => void;
  constantData?: number[];
  handleDropdown?: (isOpen: boolean) => void;
  isOpen?: boolean;
  dropdownDirection?: 'top' | 'bottom';
  icon?: React.ReactNode;
}

const RecruitPeriodSelectInput = ({
  label,
  nameYear,
  nameSeason,
  yearValue,
  seasonValue,
  onChangeYear,
  onChangeSeason,
  constantData = [],
  handleDropdown,
  isOpen = false,
  dropdownDirection = 'bottom',
  icon,
}: RecruitPeriodSelectInputProps) => {
  // [박소민] 모달 이벤트 핸들러 커스텀 훅으로 옮기기 (LabelSelectedInput과 공유 가능)
  useEffect(() => {
    if (!isOpen || !handleDropdown) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDropdown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleDropdown]);

  return (
    <div className='flex flex-col gap-3'>
      <div className='text-lg font-bold text-gray-950'>
        {label} <span className='text-red-600'>*</span>
      </div>

      <input type='hidden' name={nameYear} value={yearValue} />

      <div className='flex items-center gap-2'>
        {/* 1. 연도 선택 */}
        <div className='relative flex-1'>
          <button
            type='button'
            className={`relative flex w-full items-center justify-between rounded-lg bg-gray-50 px-5 py-[0.875rem] text-left ${isOpen ? 'ring-2 ring-gray-200' : ''}`}
            onClick={() => handleDropdown?.(!isOpen)}
          >
            <span className='font-medium text-gray-950'>{yearValue}</span>
            {icon}
          </button>

          {isOpen && (
            <>
              <div
                role='presentation'
                className='fixed inset-0 z-10 cursor-default'
                onClick={() => handleDropdown?.(false)}
              />
              <div
                className={`absolute z-20 w-full overflow-hidden rounded-lg bg-white shadow-lg ${dropdownDirection === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
              >
                <div className='max-h-40 overflow-y-auto p-1'>
                  {constantData.map((year) => (
                    <button
                      key={year}
                      type='button'
                      onClick={() => {
                        onChangeYear(year); // [Controlled]
                        handleDropdown?.(false);
                      }}
                      className='w-full rounded-md px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-950'
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 2. 시즌 선택 */}
        <div className='flex flex-[2] gap-1 rounded-lg bg-gray-50 p-1'>
          {RECRUIT_SEASON_LIST.map((each) => {
            const isSelected = seasonValue === each.season;
            return (
              <label key={each.season} className='flex-1 cursor-pointer'>
                <input
                  type='radio'
                  name={nameSeason}
                  value={each.season}
                  checked={isSelected}
                  onChange={() => onChangeSeason(each.season)} // [Controlled]
                  className='sr-only'
                />
                <div
                  className={`flex h-full items-center justify-center rounded-md px-4 py-[0.625rem] transition-colors ${
                    isSelected
                      ? 'bg-white font-bold text-gray-950 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {each.label}
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecruitPeriodSelectInput;
