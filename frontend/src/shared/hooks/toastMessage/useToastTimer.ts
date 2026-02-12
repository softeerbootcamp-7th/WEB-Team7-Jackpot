import { useEffect } from 'react';

interface UseToastTimerProps {
  isVisible: boolean;
  closeToast: () => void;
  duration?: number;
}
export const useToastTimer = ({
  isVisible,
  closeToast,
  duration = 3000,
}: UseToastTimerProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(closeToast, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, closeToast, duration]);
};
