import { useEffect } from 'react';

import { getStoredToastMessage } from '@/shared/utils/toastMessageStorage';

interface UseToastMessageProps {
  showToast: (message: string, status?: boolean) => void;
}

// 페이지 진입 후 토스트 메시지가 있는지 확인
// SPA에서 useNavigate를 통한 이동이 아닌 소셜 로그인, 결제창, 강제 새로고침의 경우
// showToast 없이 세션 스토리지에 넣기만 해도 자동으로 호출되는 형태
export const useToastMessage = ({ showToast }: UseToastMessageProps) => {
  useEffect(() => {
    const storedData = getStoredToastMessage();
    if (storedData) {
      showToast(storedData.message, storedData.status);
    }
  }, [showToast]);
};
