import { useState } from 'react';

import { RECRUIT_SEASON_LIST } from '@/shared/constants/recruitSeason';

interface RecruitPeriodSelectInputProps {
  label: string;
  // [중요] Form 수집을 위한 name props 추가
  nameYear: string; // 예: 'applyYear'
  nameSeason: string; // 예: 'applyHalf'

  // 초기값 (수정 모드 등을 위해 필요)
  defaultYear: number;
  defaultSeason: string;

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
  defaultYear,
  defaultSeason,
  constantData = [],
  handleDropdown,
  isOpen,
  dropdownDirection = 'bottom',
  icon,
}: RecruitPeriodSelectInputProps) => {
  const hasDropdown = constantData.length > 0;

  // 1. UI 업데이트를 위한 로컬 State (부모와 연결 끊음)
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedSeason, setSelectedSeason] = useState(defaultSeason);

  return (
    <div className='flex flex-col gap-3'>
      <div className='text-lg font-bold'>
        {label} <span className='text-red-600'>*</span>
      </div>

      {/* [핵심 1] 연도(Year) 데이터를 위한 숨겨진 Input 
        사용자 눈에는 안 보이지만, form 제출 시 nameYear="2025" 형태로 전송됨
      */}
      <input type='hidden' name={nameYear} value={selectedYear} required />

      <div className='flex items-center gap-2'>
        {/* 연도 선택 드롭다운 UI */}
        <div className='relative inline-block'>
          <button
            type='button'
            className={`relative flex flex-1 items-center justify-between gap-6 bg-gray-50 px-5 py-[0.875rem] ${isOpen ? 'z-20' : 'z-0'} cursor-pointer rounded-lg`}
            onClick={() => handleDropdown?.(!isOpen)}
          >
            {/* 화면에 보여주는 값은 State 사용 */}
            <div className='font-medium'>{selectedYear}</div>
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
                          // [핵심] 클릭 시 로컬 State 변경 -> Hidden Input 값도 같이 바뀜
                          setSelectedYear(year);
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

        {/* 시즌 선택 (라디오 버튼) */}
        <div className='flex flex-3 justify-between rounded-lg bg-gray-50 px-1 py-1'>
          {RECRUIT_SEASON_LIST.map((each) => (
            <div key={each.season} className='flex-grow'>
              <label className='cursor-pointer items-center select-none'>
                {/* [핵심 2] 라디오 버튼 
                   input type="radio"는 name이 같으면 그룹으로 묶여서 
                   체크된 녀석의 value 하나만 전송됩니다.
                   sr-only로 숨겨져 있지만 실제 form data 기능을 수행합니다.
                */}
                <input
                  type='radio'
                  name={nameSeason} // 예: "applyHalf"
                  value={each.season} // 예: "FIRST_HALF"
                  required
                  className='peer sr-only'
                  // React 제어: checked 여부를 state로 판단
                  checked={selectedSeason === each.season}
                  // 클릭 시 state 변경 (UI 스타일 업데이트용)
                  onChange={() => setSelectedSeason(each.season)}
                />

                {/* 스타일링용 div (State에 따라 색상 변경) */}
                <div
                  className={`flex justify-center rounded-md ${selectedSeason === each.season ? 'bg-white' : ''} px-8 py-[0.625rem]`}
                >
                  <span
                    className={`${selectedSeason === each.season ? 'font-bold text-gray-950' : 'text-gray-400'}`}
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
