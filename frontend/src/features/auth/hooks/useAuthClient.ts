import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  AUTH_API,
  AUTH_MESSAGES,
  AUTH_QUERY,
  AUTH_STORAGE,
} from '@/features/auth/constants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { setAccessToken } from '@/features/auth/libs/tokenStore';
import type {
  AuthResponse,
  CheckIdRequest,
  JoinRequest,
  LoginRequest,
} from '@/features/auth/types/authApi';
import { apiClient } from '@/shared/api/apiClient';
import { useToastMessageContext } from '@/shared/hooks/toastMessage/useToastMessageContext';

// 아이디 중복확인을 위한 커스텀 훅
export const useCheckId = () => {
  return useMutation({
    mutationFn: (userData: CheckIdRequest) =>
      apiClient.post({
        endpoint: AUTH_API.ENDPOINTS.CHECK_ID,
        body: userData,
        skipAuth: true,
      }),
  });
};
// 회원가입을 위한 커스텀 훅
export const useSignUp = () => {
  return useMutation({
    mutationFn: (userData: JoinRequest) =>
      apiClient.post({
        endpoint: AUTH_API.ENDPOINTS.SIGNUP,
        body: userData,
        skipAuth: true,
      }),
  });
};

// 로그인을 위한 커스텀 훅
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (userData: LoginRequest) => {
      const data = await apiClient.post<AuthResponse>({
        endpoint: AUTH_API.ENDPOINTS.LOGIN,
        body: userData,
        options: {
          credentials: 'include',
        },
        skipAuth: true,
      });

      if (data.accessToken) {
        login(data.accessToken);
      } else {
        throw new Error('로그인 응답에 accessToken이 없습니다.');
      }
      return data;
    },
    onSuccess: async () => {
      localStorage.setItem(
        AUTH_STORAGE.KEYS.IS_LOGGED_IN,
        AUTH_STORAGE.VALUES.TRUE,
      );
      await queryClient.invalidateQueries({
        queryKey: [AUTH_QUERY.KEYS.USERINFO, AUTH_QUERY.KEYS.NICKNAME],
      });
    },
  });
};

// 액세스 토큰 리프레시를 위한 커스텀 훅
export const useRefresh = () => {
  return useMutation({
    mutationFn: async () => {
      const data = await apiClient.post<AuthResponse>({
        endpoint: AUTH_API.ENDPOINTS.REFRESH,
        options: {
          credentials: 'include',
        },
        skipAuth: true,
      });

      if (data.accessToken) {
        setAccessToken(data.accessToken);
      }

      return data;
    },
  });
};

// 로그아웃을 위한 커스텀 훅
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastMessageContext();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: () =>
      apiClient.delete({
        endpoint: AUTH_API.ENDPOINTS.LOGOUT,
        options: { credentials: 'include' },
        skipAuth: true,
      }),
    onSuccess: () => {
      logout();
      localStorage.removeItem(AUTH_STORAGE.KEYS.IS_LOGGED_IN);
      // 로그아웃 시 전체 캐시 날리기
      queryClient.clear();
      showToast(AUTH_MESSAGES.LOGOUT.SUCCESS, true);
    },
    onError: () => {
      // UX를 위해 서버 실패와 무관하게 클라이언트 로그아웃 처리
      logout();
      localStorage.removeItem(AUTH_STORAGE.KEYS.IS_LOGGED_IN);
      queryClient.clear();
      showToast(AUTH_MESSAGES.LOGOUT.SUCCESS, true);
    },
  });
};
