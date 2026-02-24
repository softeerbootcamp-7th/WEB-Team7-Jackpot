import { useEffect, useRef } from 'react';

import { Outlet, useLocation, useNavigate } from 'react-router';

import StepItem from '@/features/upload/components/StepItem';
import UploadLayoutHeader from '@/features/upload/components/UploadLayoutHeader';

const UploadPage = () => {
  const location = useLocation();
  const isNavigatingRef = useRef(false);
  const navigate = useNavigate();

  // [브라우저 뒤로 가기] 방지
  useEffect(() => {
    const preventBack = () => {
      const currentState = window.history.state;

      // React Router의 내부 상태(idx, usr, key)를 유지하면서 커스텀 플래그 추가
      if (currentState && !currentState._preventBack) {
        window.history.pushState(
          { ...currentState, _preventBack: true },
          '',
          window.location.href,
        );
      }
    };

    const handlePopState = () => {
      if (isNavigatingRef.current) return;
      // 사용자가 브라우저 뒤로 가기를 눌렀을 때 실행
      const confirmLeave = window.confirm(
        '이 페이지를 벗어나면 작성 중인 데이터가 사라집니다. 정말 이동하시겠습니까?',
      );

      if (confirmLeave) {
        isNavigatingRef.current = true;
        window.removeEventListener('beforeunload', handleBeforeUnload);
        // 확인 시: 이미 브라우저는 한 칸 뒤로 간 상태
        navigate(-1);
      } else {
        isNavigatingRef.current = true;
        // 취소 시: 한 칸 앞으로 복구
        window.history.forward();

        // 약간의 지연 후 플래그 해제 (브라우저의 히스토리 이동 처리 시간)
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 100);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    preventBack();

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate]);

  const getCurrentStep = () => {
    if (location.pathname.includes('labeling')) return 2;
    if (location.pathname.includes('complete')) return 3;
    return 1;
  };

  const isFailed = Boolean(location.state && (location.state).isFailed);

  const currentStep = getCurrentStep();
  const stepProp =
    currentStep === 3 && isFailed ? '3-error' : String(currentStep);

  return (
    <div>
      <div className='mb-12 h-screen px-75 select-none'>
        <div className='mb-12'>
          <UploadLayoutHeader />
          <StepItem step={stepProp} />
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default UploadPage;
