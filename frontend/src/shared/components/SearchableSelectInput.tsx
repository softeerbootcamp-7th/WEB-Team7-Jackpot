import { useCallback, useId, useRef, useState } from 'react';

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
  placeholder = '선택해주세요', // 텍스트 입력이 막히므로 placeholder 문구 수정 권장
}: SearchableSelectInputProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 선택된 value로 전체 목록이 필터링 되어버리는 버그를 막기 위해 검색 로직을 우회
  const displayOptions = options;

  const { highlightedIndex, setHighlightedIndex, listRef, handleKeyDown } =
    useDropdownKeyboard({
      isOpen,
      setIsOpen,
      itemCount: displayOptions.length,
      onSelect: (index) => {
        onChange(String(displayOptions[index]));
      },
    });

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useOutsideClick(containerRef, handleClose, isOpen);

  const listboxId = useId();
  const getOptionId = (index: number) => `${listboxId}-option-${index}`;

  return (
    <div className='relative w-full' ref={containerRef}>
      <input
        type='text'
        role='combobox'
        aria-expanded={isOpen}
        aria-autocomplete='none' // list에서 none으로 변경 (더 이상 자동완성 검색이 아니므로)
        aria-controls={listboxId}
        aria-activedescendant={
          highlightedIndex >= 0 ? getOptionId(highlightedIndex) : undefined
        }
        aria-label={placeholder}
        value={value}
        // 1. 핵심 변경 사항: readOnly 속성을 추가하여 타이핑을 막습니다.
        readOnly
        // 2. onChange 제거: readOnly 상태에서는 사용자의 타이핑 이벤트가 발생하지 않으므로
        // input 요소 자체의 onChange는 불필요하여 제거했습니다.
        // (부모 컴포넌트로 값을 올리는 props.onChange는 드롭다운 항목 클릭 시 정상 작동합니다)

        onKeyDown={handleKeyDown}
        // 3. 클릭 시 열고 닫는 토글 형식으로 UX 개선
        onClick={() => setIsOpen((prev) => !prev)}
        autoComplete='off'
        // 4. CSS 변경: 입력 칸이 아닌 '선택 버튼'처럼 느껴지도록 cursor-pointer 추가
        className='text-caption-m inline-flex h-9 w-full cursor-pointer items-center justify-start rounded-lg bg-white px-4 font-normal text-gray-950 ring-1 ring-gray-200 outline-none placeholder:text-gray-400 focus:ring-blue-500'
        placeholder={placeholder}
      />

      {isOpen && (
        <div className='absolute top-full z-20 mt-2 w-full overflow-hidden rounded-lg bg-white shadow-lg'>
          <div ref={listRef} className='max-h-42 overflow-y-auto p-1'>
            {displayOptions.length > 0 ? (
              displayOptions.map((item, index) => {
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
                목록이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelectInput;
