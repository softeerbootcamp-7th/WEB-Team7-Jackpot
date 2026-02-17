import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import {
  removeAccessToken,
  setAccessToken,
} from '@/features/auth/libs/tokenStore';
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
        endpoint: '/auth/checkid',
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
        endpoint: '/auth/join',
        body: userData,
        skipAuth: true,
      }),
  });
};

// 로그인을 위한 커스텀 훅
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: LoginRequest) => {
      const data: AuthResponse = await apiClient.post({
        endpoint: '/auth/login',
        body: userData,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userInfo'] }),
  });
};

// 액세스 토큰 리프레시를 위한 커스텀 훅
export const useRefresh = () => {
  return useMutation({
    mutationFn: async () => {
      const data: AuthResponse = await apiClient.post({
        endpoint: '/auth/refresh',
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
  const navigate = useNavigate();
  const { showToast } = useToastMessageContext();

  return useMutation({
    mutationFn: () =>
      apiClient.delete({
        endpoint: '/auth/logout',
        options: { credentials: 'include' },
        skipAuth: true,
      }),
    onSuccess: () => {
      removeAccessToken();
      // 로그아웃 시 전체 캐시 날리기
      queryClient.clear();
      showToast('로그아웃 되었습니다', true);
      navigate('/');
    },
  });
};
