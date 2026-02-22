import { useEffect } from 'react';

export const useEscapeKey = (
  onEscape: () => void,
  isEnabled: boolean = true,
) => {
  useEffect(() => {
    if (!isEnabled) return;

    // 주의: React.KeyboardEvent가 아닌 네이티브 전역 KeyboardEvent 입니다.
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
