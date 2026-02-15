import { useMemo, useState } from 'react';

// 1. 제네릭 T 정의 (string 또는 number)
interface LabeledSelectInputProps<T extends string | number> {
  label: string;
  name: string; // [필수] Form 데이터 수집을 위한 name 속성
  defaultValue: T; // 초기값 (value 대신 사용)
  constantData?: T[];
  handleDropdown: (isOpen: boolean) => void;
  isOpen: boolean;
  dropdownDirection?: 'top' | 'bottom';
}

const LabeledSelectInput = <T extends string | number>({
  label,
  name,
  defaultValue,
  constantData = [],
  handleDropdown,
  isOpen,
  dropdownDirection = 'bottom',
}: LabeledSelectInputProps<T>) => {
  const hasDropdown = constantData.length > 0;

  // 2. 내부 상태 관리 (부모 의존성 제거)
  // 입력된 값은 화면 표시용이므로 string | number 다 허용
  const [innerValue, setInnerValue] = useState<string | number>(defaultValue);

  // 3. 입력 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInnerValue(e.target.value);

    if (!isOpen && hasDropdown) {
      handleDropdown(true);
    }
  };

  // 4. 필터링 로직 (입력값 기준 즉시 필터링)
  const searchData = useMemo(
    () =>
      constantData.filter((each) =>
        String(each).toLowerCase().includes(String(innerValue).toLowerCase()),
      ),
    [constantData, innerValue],
  );

  return (
    <div className='flex flex-col gap-3'>
      <label className='text-lg font-bold'>
        {label} <span className='text-red-600'>*</span>
      </label>

      <div className='relative inline-block'>
        <input
          type='text'
          name={name}
          required={true}
          value={String(innerValue)}
          onChange={handleInputChange}
          className={`relative w-full rounded-lg bg-gray-50 px-5 py-[0.875rem] focus:outline-none ${isOpen ? 'z-20' : 'z-0'}`}
          onClick={() => handleDropdown?.(!isOpen)}
          autoComplete='off' // 브라우저 자동완성과 겹치지 않게
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
                  searchData.map((item, index) => (
                    <button
                      type='button'
                      onClick={() => {
                        setInnerValue(item);
                        handleDropdown(false);
                      }}
                      key={index}
                      className='w-full cursor-pointer rounded-md px-4 py-[0.875rem] text-left text-[0.813rem] font-medium text-gray-700 hover:bg-gray-50 hover:font-bold hover:text-gray-950 focus:bg-gray-100 focus:text-gray-900 focus:outline-hidden'
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
