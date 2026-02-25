import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  checkIdApi,
  loginApi,
  logoutApi,
  refreshApi,
  signUpApi,
} from '@/features/auth/api/authApi';
import {
  AUTH_MESSAGES,
  AUTH_QUERY,
  AUTH_STORAGE,
} from '@/features/auth/constants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { setAccessToken } from '@/features/auth/libs/tokenStore';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';

// 아이디 중복확인을 위한 커스텀 훅
export const useCheckId = () => useMutation({ mutationFn: checkIdApi });

// 회원가입을 위한 커스텀 훅
export const useSignUp = () => useMutation({ mutationFn: signUpApi });

// 로그인을 위한 커스텀 훅
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastMessageContext();
  const { login } = useAuth();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // 토큰 저장
      if (data.accessToken) login(data.accessToken);

      // 로그인 상태 로컬 스토리지 기록
      localStorage.setItem(
        AUTH_STORAGE.KEYS.IS_LOGGED_IN,
        AUTH_STORAGE.VALUES.TRUE,
      );

      // 유저 정보 갱신
      queryClient.invalidateQueries({
        queryKey: [AUTH_QUERY.KEYS.USERINFO, AUTH_QUERY.KEYS.NICKNAME],
      });

      showToast(AUTH_MESSAGES.LOGIN.SUCCESS, true);
    },
  });
};

// 액세스 토큰 리프레시를 위한 커스텀 훅
export const useRefresh = () => {
  return useMutation({
    mutationFn: refreshApi,
    onSuccess: (data) => {
      if (data.accessToken) setAccessToken(data.accessToken);
    },
  });
};

// 로그아웃을 위한 커스텀 훅
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastMessageContext();
  const { logout } = useAuth();

  const handleClearAuth = () => {
    logout();
    localStorage.removeItem(AUTH_STORAGE.KEYS.IS_LOGGED_IN);
    // 전체 캐시 날리기
    queryClient.clear();
  };

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      handleClearAuth();
      showToast(AUTH_MESSAGES.LOGOUT.SUCCESS, true);
    },
    onError: () => {
      // 서버 에러와 무관하게 클라이언트 세션은 종료 (UX)
      handleClearAuth();
      showToast(AUTH_MESSAGES.LOGOUT.SUCCESS, true);
    },
  });
};
