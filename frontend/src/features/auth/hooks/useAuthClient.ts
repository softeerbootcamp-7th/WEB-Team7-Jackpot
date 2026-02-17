import { useMutation, useQueryClient } from '@tanstack/react-query';

import { setAccessToken } from '@/features/auth/libs/tokenStore';
import type {
  AuthResponse,
  CheckIdRequest,
  JoinRequest,
  LoginRequest,
} from '@/features/auth/types/authApi';
import { apiClient } from '@/shared/api/apiClient';

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

// 액세스 토큰 리프레시를 위한 메서드
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

// [윤종근] - TODO: 추후에 로그아웃 구현 시 엑세스 토큰 비우는 커스텀 훅 추가 필요
