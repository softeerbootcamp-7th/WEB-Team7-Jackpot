import { useContext } from 'react';

import { ToastMessageContext } from '@/shared/context/ToastMessageContext';

// 외부에서 전역 상태를 꺼내쓸 수 있도록 커스텀 훅 제공
export const useToastMessageContext = () => {
  const context = useContext(ToastMessageContext);
  if (!context) throw new Error('토스트 메시지 전역 상태 문제 발생');
  return context;
};
