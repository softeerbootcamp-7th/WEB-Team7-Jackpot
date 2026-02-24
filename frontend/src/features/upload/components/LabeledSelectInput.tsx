import { useEffect, useMemo, useState } from 'react';

interface LabeledSelectInputProps {
  label: string;
  value: string | number;
  constantData?:
    | readonly { label: string; value: string }[]
    | readonly string[];
  handleChange: (value: string | number) => void;
  handleDropdown: (isOpen: boolean) => void;
  isOpen: boolean;
  dropdownDirection: 'top' | 'bottom';
  isError?: boolean;
}

const LabeledSelectInput = ({
  label,
  value,
  constantData = [],
  handleChange,
  handleDropdown,
  isOpen,
  dropdownDirection = 'bottom',
  isError = false,
}: LabeledSelectInputProps) => {
  const hasDropdown = constantData.length > 0;
  const [debounceValue, setDebounceValue] = useState<string | number>(value);

  const isQuestionType = label === '문항 유형';

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebounceValue(value);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [value]);

  // 데이터가 커졌을 때를 대비하여 useMemo 적용
  const searchData = useMemo(() => {
    if (isQuestionType) return constantData;

    return constantData.filter((each) => {
      // 타입 내로잉
      const targetValue = typeof each === 'string' ? each : each.label;

      // boolean 값을 return 해야 filter가 동작
      return targetValue.includes(debounceValue.toString());
    });
  }, [constantData, debounceValue, isQuestionType]);

  return (
    <div className='flex flex-col gap-3'>
      <div className='text-lg font-bold'>
        {label} <span className='text-red-600'>*</span>
      </div>

      <div className='relative inline-block'>
        <input
          type='text'
          value={value}
          readOnly={isQuestionType}
          placeholder={isError ? `${label}을(를) 입력해주세요` : ''}
          onChange={(e) => {
            if (!isQuestionType) handleChange(e.target.value);
          }}
          className={`relative w-full rounded-lg bg-gray-50 px-5 py-[0.875rem] focus:outline-none ${isOpen ? 'z-20' : 'z-0'} ${isQuestionType ? 'cursor-pointer' : ''} ${
            isError
              ? 'border border-red-600 text-red-600 placeholder:text-red-400'
              : 'border border-transparent'
          }`}
          onClick={() => handleDropdown?.(!isOpen)}
        />
        {isQuestionType && (
          <span
            className={`text-body-s mt-1 block w-full transition-colors duration-200 ${
              isQuestionType && isError
                ? 'text-red-600'
                : 'text-transparent select-none'
            }`}
          >
            자기소개서 내에서 문항 유형을 찾지 못했어요
          </span>
        )}

        {hasDropdown && isOpen && (
          <>
            <div
              className='fixed inset-0 z-10 cursor-default'
              onClick={() => handleDropdown(false)}
            />
            <div
              className={`absolute z-20 max-h-48 w-full overflow-y-scroll rounded-lg bg-white shadow-lg select-none ${dropdownDirection === 'top' ? 'bottom-full mb-2' : 'mt-2'}`}
            >
              <div className='flex flex-col gap-1 p-1'>
                {searchData &&
                  searchData.map((each, index) => {
                    const displayValue =
                      typeof each === 'string' ? each : each.label;
                    return (
                      <button
                        type='button'
                        onClick={() => {
                          handleChange(displayValue);
                          handleDropdown(false);
                        }}
                        key={index}
                        className='w-full cursor-pointer rounded-md px-4 py-[0.875rem] text-left text-[0.813rem] font-medium text-gray-700 hover:bg-gray-50 hover:font-bold hover:text-gray-950 focus:bg-gray-100 focus:text-gray-900 focus:outline-hidden'
                      >
                        {displayValue}
                      </button>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LabeledSelectInput;
