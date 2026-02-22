import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  itemCount: number; // 리스트의 총 개수
  onSelect: (index: number) => void; // 엔터 키를 눌렀을 때 실행할 함수
}

export const useDropdownKeyboard = ({
  isOpen,
  setIsOpen,
  itemCount,
  onSelect,
}: Props) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(isOpen);

  // useEffect 없이 렌더링 중에 조건문으로 검사합니다.
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    setHighlightedIndex(-1);
  }

  // 스크롤 자동 동기화 로직
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const listElement = listRef.current;
      const highlightedElement = listElement.children[
        highlightedIndex
      ] as HTMLElement;

      if (highlightedElement) {
        const listTop = listElement.scrollTop;
        const listBottom = listTop + listElement.clientHeight;
        const elementTop = highlightedElement.offsetTop;
        const elementBottom = elementTop + highlightedElement.clientHeight;

        if (elementTop < listTop) {
          listElement.scrollTop = elementTop;
        } else if (elementBottom > listBottom) {
          listElement.scrollTop = elementBottom - listElement.clientHeight;
        }
      }
    }
  }, [highlightedIndex, isOpen]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < itemCount) {
          onSelect(highlightedIndex);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  return {
    highlightedIndex,
    setHighlightedIndex,
    listRef,
    handleKeyDown,
  };
};
