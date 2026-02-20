import { useEffect, useRef } from 'react';

import type { RefObject } from 'react';

const useModalKeyboardNavigation = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  onDismiss: () => void,
  active: boolean,
) => {
  const onDismissRef = useRef(onDismiss);

  // onDismiss 최신화
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!active) return;
    const modal = ref.current;
    if (!modal) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // 모달 내부 포커스 가능한 엘리먼트 조회
    const getFocusable = () =>
      modal.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );

    const focusableEls = getFocusable();
    if (focusableEls.length > 0) {
      focusableEls[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onDismissRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleKeyDown);

    return () => {
      modal.removeEventListener('keydown', handleKeyDown);
      try {
        previouslyFocused?.focus();
      } catch (e) {
        console.warn('Could not restore focus', e);
      }
    };
  }, [active, ref]);
};

export default useModalKeyboardNavigation;
