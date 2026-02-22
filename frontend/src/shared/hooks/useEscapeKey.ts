import { useEffect } from 'react';

const useEscapeKey = (onEscape: () => void, isEnabled: boolean = true) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape, isEnabled]);
};

export default useEscapeKey;
