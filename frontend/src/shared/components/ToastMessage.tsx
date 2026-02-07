import { useEffect } from 'react';

import { CommonIcon as I } from '@/shared/icons';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  status: boolean;
}

const ToastMessage = ({ message, onClose, duration = 3000, status }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className='fixed right-0 bottom-0 left-0 z-50 flex justify-center pb-4'>
      <div className='animate-fade-in-out z-50 flex items-center gap-4 rounded-lg bg-black/60 px-6 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md'>
        {status ? (
          <I.DoneIcon width='20' height='20' />
        ) : (
          <I.FailIcon width='20' height='20' />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default ToastMessage;
