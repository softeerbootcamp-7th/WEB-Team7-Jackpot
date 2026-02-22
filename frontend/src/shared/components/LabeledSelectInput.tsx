import { useMemo } from 'react';

import { useDropdownKeyboard } from '@/shared/hooks/useDropDownKeyboard';

interface LabeledSelectInputProps<T extends string | number> {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  constantData?: readonly T[];
  handleDropdown: (isOpen: boolean) => void;
  isOpen: boolean;
  dropdownDirection?: 'top' | 'bottom';
}

const LabeledSelectInput = <T extends string | number>({
  label,
  name,
  value,
  onChange,
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

  const { highlightedIndex, setHighlightedIndex, listRef, handleKeyDown } =
    useDropdownKeyboard({
      isOpen,
      setIsOpen: handleDropdown,
      itemCount: searchData.length, // 필터링된 데이터의 갯수를 기준으로 함
      onSelect: (index) => onChange(String(searchData[index])), // 필터링된 데이터에서 선택
    });

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
          onKeyDown={handleKeyDown} // 키보드 이벤트 연결
          onChange={(e) => {
            onChange(e.target.value);
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
              <div
                ref={listRef} // 스크롤 컨테이너에 Ref 연결
                className='max-h-48 overflow-y-auto p-1'
              >
                {searchData &&
                  searchData.map((item, index) => {
                    const isHighlighted = index === highlightedIndex; // 현재 아이템 하이라이트 여부

                    return (
                      <button
                        key={`${item}-${index}`}
                        type='button'
                        onMouseEnter={() => setHighlightedIndex(index)} // 마우스가 올라가면 인덱스 동기화
                        onClick={() => {
                          onChange(String(item));
                          handleDropdown(false);
                        }}
                        className={`w-full rounded-md px-4 py-3 text-left text-sm font-medium transition-colors ${
                          isHighlighted
                            ? 'bg-gray-100 font-bold text-gray-950' // 선택됐을 때의 스타일
                            : 'text-gray-700 hover:bg-gray-50 hover:font-bold hover:text-gray-950'
                        }`}
                      >
                        {item}
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
