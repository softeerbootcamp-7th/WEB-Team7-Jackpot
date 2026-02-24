import { useEffect, useRef, useState } from 'react';

import { Outlet, useLocation, useNavigate } from 'react-router';

import StepItem from '@/features/upload/components/StepItem';
import { uploadHeaderText } from '@/features/upload/constants/uploadPage';
import ContentHeader from '@/shared/components/ContentHeader';
import ConfirmModal from '@/shared/components/modal/ConfirmModal';

const UploadPage = () => {
  const location = useLocation();
  const isNavigatingRef = useRef(false);
  const navigate = useNavigate();

  // 1. 커스텀 모달을 띄우기 위한 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 브라우저 뒤로 가기 방지
  useEffect(() => {
    const preventBack = () => {
      const currentState = window.history.state;

      // React Router의 내부 상태를 유지하면서 커스텀 플래그 추가 (함정 파기)
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

      // 뒤로가기(popstate)가 발생 = 브라우저 주소 변화
      // 모달을 띄우는 동안 화면이 바뀌면 안 되니까, 다시 강제로 앞으로(forward) 보냄
      window.history.forward();

      // 그리고 우리가 만든 비동기 모달을 띄우는 거지.
      setIsModalOpen(true);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // 구형 브라우저 호환성을 위한 방어 코드
    };

    preventBack();

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate]);

  // 2. 모달에서 이동하기(확인)를 눌렀을 때의 동작
  const handleConfirmLeave = () => {
    setIsModalOpen(false);
    isNavigatingRef.current = true; // 이벤트 리스너가 무시하도록 플래그 ON

    // 우리는 방금 popstate에서 forward()를 통해 다시 '현재 페이지(함정)'에 묶여있어.
    // 진짜 이전 페이지로 탈출하려면 함정(-1)을 지나 원래 가려던 곳(-2)으로 가야 해.
    navigate(-2);
  };

  // 3. 모달에서 [머무르기(취소)]를 눌렀을 때의 동작
  const handleCancelLeave = () => {
    setIsModalOpen(false);
    // 이미 history.forward()로 화면을 현재 페이지에 붙잡아 뒀기 때문에 모달만 닫으면 끝이야!
  };

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

      <ConfirmModal
        isOpen={isModalOpen}
        type='warning'
        title='페이지 이동 경고'
        description={`이 페이지를 벗어나면 작성 중인 데이터가 사라집니다.\n정말 이동하시겠습니까?`}
        confirmText='이동하기'
        cancelText='머무르기'
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />
    </div>
  );
};

export default UploadPage;
