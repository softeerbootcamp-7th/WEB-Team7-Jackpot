import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import ToastMessage from '@/shared/components/ToastMessage';

interface ToastMessageContextType {
  showToast: (message: string, status?: boolean) => void;
  closeToast: () => void;
}

interface ToastMessageProviderProps {
  children: React.ReactNode;
}

interface ToastStateType {
  message: string;
  status: boolean;
  isVisible: boolean;
}

// 빈 전역 상태 정의
const ToastMessageContext = createContext<ToastMessageContextType | null>(null);

// Provider 정의
export const ToastMessageProvider = ({
  children,
}: ToastMessageProviderProps) => {
  const [toastState, setToastState] = useState<ToastStateType>({
    message: '',
    status: false,
    isVisible: false,
  });

  const showToast = useCallback((message: string, status: boolean = false) => {
    setToastState({
      message: message,
      status: status,
      isVisible: true,
    });
  }, []);

  const closeToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, isVisible: false }));
  }, []);

  // 토스트 메시지가 켜진 후 3초 뒤에 꺼지도록 타이머 시작
  useEffect(() => {
    if (toastState.isVisible) {
      const timer = setTimeout(closeToast, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastState.isVisible, closeToast]);

  // 페이지 진입 후 토스트 메시지가 있는지 확인
  // SPA에서 useNavigate를 통한 이동이 아닌 소셜 로그인, 결제창, 강제 새로고침의 경우
  // showToast 없이 세션 스토리지에 넣기만 해도 자동으로 호출되는 형태
  useEffect(() => {
    const toastMessage = sessionStorage.getItem('TOAST_MESSAGE');

    if (toastMessage) {
      try {
        const { message, status } = JSON.parse(toastMessage);
        showToast(message, status);
      } catch (e) {
        console.error('토스트 메시지 파싱 에러', e);
      } finally {
        sessionStorage.removeItem('TOAST_MESSAGE');
      }
    }
  }, [showToast]);

  return (
    <ToastMessageContext.Provider
      value={{
        showToast,
        closeToast,
      }}
    >
      {children}
      {toastState.isVisible && (
        <ToastMessage message={toastState.message} status={toastState.status} />
      )}
    </ToastMessageContext.Provider>
  );
};

// 외부에서 전역 상태를 꺼내쓸 수 있도록 커스텀 훅 제공
export const useToastMessageContext = () => {
  const context = useContext(ToastMessageContext);
  if (!context) throw new Error('토스트 메시지 전역 상태 문제 발생');
  return context;
};
