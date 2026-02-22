import { useCallback, useId, useRef } from 'react';

import { RECRUIT_SEASON_LIST } from '@/shared/constants/recruitSeason';
import { useDropdownKeyboard } from '@/shared/hooks/useDropDownKeyboard';
import useOutsideClick from '@/shared/hooks/useOutsideClick'; // 잘 만들어둔 훅 활용!
import type { ApiApplyHalf } from '@/shared/types/coverLetter';

interface RecruitPeriodSelectInputProps {
  label: string;
  yearValue: number;
  seasonValue: ApiApplyHalf;
  onChangeYear: (year: number) => void;
  onChangeSeason: (season: ApiApplyHalf) => void;
  // 외부 상수(as const)를 에러 없이 바로 넘길 수 있도록 readonly 배열 허용
  constantData?: readonly number[];
  handleDropdown: (isOpen: boolean) => void;
  isOpen?: boolean;
  dropdownDirection?: 'top' | 'bottom';
  icon?: React.ReactNode;
}

const RecruitPeriodSelectInput = ({
  label,
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
  // 드롭다운 외부 클릭 감지를 위한 ref
  const containerRef = useRef<HTMLDivElement>(null);

  // 접근성을 위한 고유 ID 부여
  const listboxId = useId();

  const closeDropdown = useCallback(() => {
    handleDropdown?.(false);
  }, [handleDropdown]);

  // 1. 외부 영역 클릭 시 닫힘 (기존의 fixed 투명 배경 div를 대체!)
  useOutsideClick(containerRef, closeDropdown, isOpen);

  // 2. 키보드 상/하 네비게이션 훅 (Escape 키로 닫기 포함)
  const { highlightedIndex, setHighlightedIndex, listRef, handleKeyDown } =
    useDropdownKeyboard({
      isOpen,
      setIsOpen: handleDropdown,
      itemCount: constantData.length,
      onSelect: (index) => onChangeYear(constantData[index]),
    });

  return (
    <div className='flex flex-col gap-3'>
      <div className='text-lg font-bold text-gray-950'>
        {label} <span className='text-red-600'>*</span>
      </div>

      <div className='flex items-center gap-2'>
        <div className='relative flex-1' ref={containerRef}>
          <button
            type='button'
            className={`relative flex w-full items-center justify-between rounded-lg bg-gray-50 px-5 py-[0.875rem] text-left ${isOpen ? 'ring-2 ring-gray-200' : ''}`}
            onClick={() => handleDropdown(!isOpen)}
            onKeyDown={handleKeyDown}
            aria-haspopup='listbox'
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
          >
            <span className='font-medium text-gray-950'>{yearValue}</span>
            {icon}
          </button>

          {isOpen && (
            <div
              id={listboxId}
              role='listbox'
              className={`absolute z-20 w-full overflow-hidden rounded-lg bg-white shadow-lg ${dropdownDirection === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
            >
              <div ref={listRef} className='max-h-40 overflow-y-auto p-1'>
                {constantData.map((year, index) => {
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <button
                      key={year}
                      type='button'
                      role='option'
                      aria-selected={year === yearValue}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => {
                        onChangeYear(year);
                        closeDropdown();
                      }}
                      className={`w-full rounded-md px-4 py-3 text-left text-sm font-medium transition-colors ${
                        isHighlighted
                          ? 'bg-gray-100 font-bold text-gray-950'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950'
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div
          className='flex flex-[2] gap-1 rounded-lg bg-gray-50 p-1'
          role='radiogroup'
          aria-label='지원 시즌 선택'
        >
          {RECRUIT_SEASON_LIST.map((each) => {
            const isSelected = seasonValue === each.season;
            return (
              <label key={each.season} className='flex-1 cursor-pointer'>
                <input
                  type='radio'
                  value={each.season}
                  checked={isSelected}
                  onChange={() => onChangeSeason(each.season)}
                  className='sr-only'
                />
                <div
                  className={`focusable-card flex h-full items-center justify-center rounded-md px-4 py-[0.625rem] transition-colors ${
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
