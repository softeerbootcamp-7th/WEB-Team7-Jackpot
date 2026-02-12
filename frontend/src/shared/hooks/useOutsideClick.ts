import { useCallback, useEffect } from 'react';

import type { RefObject } from 'react';

const useOutsideClick = (
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
  enabled: boolean = true,
) => {
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!enabled) return;
      if (ref.current?.contains(e.target as Node)) return;
      onOutsideClick();
    },
    [ref, onOutsideClick, enabled],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [handleMouseDown]);
};

export default useOutsideClick;
