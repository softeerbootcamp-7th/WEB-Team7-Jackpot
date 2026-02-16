import { useEffect, useMemo } from 'react';

interface LabeledSelectInputProps<T extends string | number> {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  constantData?: T[];
  handleDropdown: (isOpen: boolean) => void;
  isOpen: boolean;
  dropdownDirection?: 'top' | 'bottom';
}

const LabeledSelectInput = <T extends string | number>({
  label,
  name,
  value, // 외부 prop 사용
  onChange, // 외부 prop 사용
  constantData = [],
  handleDropdown,
  isOpen,
  dropdownDirection = 'bottom',
}: LabeledSelectInputProps<T>) => {
  // 검색 필터링
  const searchData = useMemo(() => {
    if (!constantData) return [];
    return constantData.filter((each) =>
      String(each).toLowerCase().includes(value.toLowerCase()),
    );
  }, [constantData, value]);

  const inputId = `labeled-select-${name}`;

  // [박소민] 모달 이벤트 핸들러 커스텀 훅으로 옮기기 (RecruitPeriodSelectInput과 공유 가능)
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
      <label htmlFor={inputId} className='text-lg font-bold text-gray-950'>
        {label} <span className='text-red-600'>*</span>
      </label>

      <div className='relative'>
        <input
          id={inputId}
          type='text'
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e.target.value); // 부모 상태 업데이트
            if (!isOpen) handleDropdown(true);
          }}
          onClick={() => handleDropdown(!isOpen)}
          autoComplete='off'
          className='w-full rounded-lg bg-gray-50 px-5 py-[0.875rem] text-gray-950 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none'
          placeholder={`${label}을(를) 입력해주세요`}
        />

        {constantData.length > 0 && isOpen && (
          <>
            <div
              role='presentation'
              className='fixed inset-0 z-10 cursor-default'
              onClick={() => handleDropdown(false)}
            />
            <div
              className={`absolute z-20 w-full overflow-hidden rounded-lg bg-white shadow-lg ${dropdownDirection === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
            >
              <div className='max-h-48 overflow-y-auto p-1'>
                {searchData &&
                  searchData.map((item, index) => (
                    <button
                      key={`${item}-${index}`}
                      type='button'
                      onClick={() => {
                        onChange(String(item)); // 선택 시 부모 업데이트
                        handleDropdown(false);
                      }}
                      className='w-full rounded-md px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:font-bold hover:text-gray-950'
                    >
                      {item}
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
