import { useEffect, useMemo, useState } from 'react';

interface LabeledSelectInputProps {
  label: string;
  value: string | number;
  constantData?: string[];
  handleChange: (value: string | number) => void;
  handleDropdown: (isOpen: boolean) => void;
  isOpen: boolean;
  dropdownDirection: 'top' | 'bottom';
}

const LabeledSelectInput = ({
  label,
  value,
  constantData = [],
  handleChange,
  handleDropdown,
  isOpen,
  dropdownDirection = 'bottom',
}: LabeledSelectInputProps) => {
  const hasDropdown = constantData.length > 0;
  const [debounceValue, setDebounceValue] = useState<string | number>(value);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebounceValue(value);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [value]);

  // 데이터가 커졌을 때를 대비하여 useMemo 적용
  const searchData = useMemo(
    () =>
      constantData.filter((each) => each.includes(debounceValue.toString())),
    [constantData, debounceValue],
  );
  return (
    <div className='flex flex-col gap-3'>
      <div className='text-lg font-bold'>
        {label} <span className='text-red-600'>*</span>
      </div>

      <div className='relative inline-block'>
        <input
          type='text'
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={`relative w-full rounded-lg bg-gray-50 px-5 py-[0.875rem] focus:outline-none ${isOpen ? 'z-20' : 'z-0'}`}
          onClick={() => handleDropdown?.(!isOpen)}
        />
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
                  searchData.map((name, index) => (
                    <button
                      type='button'
                      onClick={() => {
                        handleChange(name);
                        handleDropdown(false);
                      }}
                      key={index}
                      className='w-full cursor-pointer rounded-md px-4 py-[0.875rem] text-left text-[0.813rem] font-medium text-gray-700 hover:bg-gray-50 hover:font-bold hover:text-gray-950 focus:bg-gray-100 focus:text-gray-900 focus:outline-hidden'
                    >
                      {name}
                    </button>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LabeledSelectInput;
