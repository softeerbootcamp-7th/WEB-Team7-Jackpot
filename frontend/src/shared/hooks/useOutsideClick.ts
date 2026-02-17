import { useEffect, useRef } from 'react';

import type { RefObject } from 'react';

const useOutsideClick = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutsideClick: () => void,
  enabled: boolean = true,
) => {
  const savedHandler = useRef(onOutsideClick);

  useEffect(() => {
    savedHandler.current = onOutsideClick;
  }, [onOutsideClick]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof document === 'undefined') return;

    const handlePointerDown = (event: PointerEvent) => {
      const el = ref.current;
      if (!el) return;

      const target = event.target;
      if (!(target instanceof Node)) return;

      if (el.contains(target)) return;

      savedHandler.current();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [ref, enabled]);
};

export default useOutsideClick;
