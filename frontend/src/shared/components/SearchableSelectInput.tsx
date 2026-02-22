import { useCallback, useId, useMemo, useRef, useState } from 'react';

import { useDropdownKeyboard } from '@/shared/hooks/useDropDownKeyboard';
import useOutsideClick from '@/shared/hooks/useOutsideClick';

interface SearchableSelectInputProps<T extends string | number> {
  value: string;
  onChange: (value: string) => void;
  options: readonly T[];
  placeholder?: string;
}

const SearchableSelectInput = <T extends string | number>({
  value,
  onChange,
  options,
  placeholder = '입력 또는 선택해주세요',
}: SearchableSelectInputProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. 검색 필터링 로직
  const filteredOptions = useMemo(() => {
    if (!value) return options;
    return options.filter((option) =>
      String(option).toLowerCase().includes(value.toLowerCase()),
    );
  }, [options, value]);

  // 2. 키보드 네비게이션 훅 연결
  const { highlightedIndex, setHighlightedIndex, listRef, handleKeyDown } =
    useDropdownKeyboard({
      isOpen,
      setIsOpen,
      itemCount: filteredOptions.length,
      onSelect: (index) => {
        onChange(String(filteredOptions[index]));
      },
    });

  // 드롭다운 닫기 핸들러 메모이제이션
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 3. 커스텀 훅 적용 (메모이제이션된 핸들러 사용)
  useOutsideClick(containerRef, handleClose, isOpen);

  const listboxId = useId();
  const getOptionId = (index: number) => `${listboxId}-option-${index}`;

  return (
    <div className='relative w-full' ref={containerRef}>
      <input
        type='text'
        role='combobox'
        aria-expanded={isOpen}
        aria-autocomplete='list'
        aria-controls={listboxId}
        aria-activedescendant={
          highlightedIndex >= 0 ? getOptionId(highlightedIndex) : undefined
        }
        aria-label={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onClick={() => setIsOpen(true)}
        autoComplete='off'
        className='text-caption-m inline-flex h-9 w-full items-center justify-start rounded-lg bg-white px-4 font-normal text-gray-950 ring-1 ring-gray-200 outline-none placeholder:text-gray-400 focus:ring-blue-500'
        placeholder={placeholder}
      />

      {isOpen && (
        <div className='absolute top-full z-20 mt-2 w-full overflow-hidden rounded-lg bg-white shadow-lg'>
          <div ref={listRef} className='max-h-42 overflow-y-auto p-1'>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item, index) => {
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={String(item)}
                    type='button'
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => {
                      onChange(String(item));
                      setIsOpen(false);
                    }}
                    className={`block w-full rounded-md px-4 py-3 text-left text-sm transition-colors ${
                      isHighlighted
                        ? 'bg-gray-100 font-bold text-gray-950'
                        : 'font-medium text-gray-700 hover:bg-gray-50 hover:font-bold hover:text-gray-950'
                    }`}
                  >
                    {item}
                  </button>
                );
              })
            ) : (
              <div className='px-4 py-3 text-sm text-gray-500'>
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelectInput;
