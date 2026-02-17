import { useEffect } from 'react';

import { useLocation, useNavigate } from 'react-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import ReviewLayout from '@/features/review/components/ReviewLayout';
import { reviewHeaderText } from '@/features/review/constants';
import ContentHeader from '@/shared/components/ContentHeader';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';

const ReviewPage = () => {
  // TODO: WebSocket 연결 및 접근 제어 후 데이터 요청 구현
  // 1. WebSocket 연결
  // 2. 연결 후 서버에서 접근 권한 확인 (권한 없으면 toast + 리다이렉트)
  // 3. 접근 권한 확인 전까지 로딩 UI 표시
  // 4. 접근 허용 후 <ReviewLayout /> 조건부 렌더링
  // 5. ReviewLayout은 마운트 시점에 WebSocket 연결 + 접근 권한이 보장되므로 내부 fetch 로직 그대로 유지

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToastMessageContext();

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('로그인이 필요한 페이지입니다.', false);
      navigate(
        `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`,
        {
          replace: true,
        },
      );
    }
  }, [
    isAuthenticated,
    navigate,
    location.pathname,
    showToast,
    location.search,
  ]);

  if (!isAuthenticated) return null;

  return (
    <div className='flex h-[calc(100vh-6.25rem)] w-full min-w-[1700px] flex-col px-75'>
      <ContentHeader {...reviewHeaderText} />
      <ReviewLayout />
    </div>
  );
};

export default ReviewPage;
