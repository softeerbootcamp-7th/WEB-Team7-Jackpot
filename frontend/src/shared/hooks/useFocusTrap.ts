import { useEffect, useRef } from 'react';

export const useFocusTrap = (isOpen: boolean) => {
  const modalRef = useRef<HTMLDivElement>(null);
  // 모달이 열리기 직전의 포커스된 요소를 기억할 ref
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. 모달이 열리는 순간, 현재 브라우저에서 포커스된 요소를 저장
    previousFocusRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const modalElement = modalRef.current;
      if (!modalElement) return;

      const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as NodeListOf<HTMLElement>;

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const focusableNodes = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>;

    if (focusableNodes?.length) {
      focusableNodes[0].focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // 2. 모달이 닫힐 때(클린업 될 때) 원래 요소로 포커스 되돌리기
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  return modalRef;
};
