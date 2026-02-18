import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (userData: LoginRequest) => {
      const data = await apiClient.post<AuthResponse>({
        endpoint: '/auth/login',
        body: userData,
        options: {
          credentials: 'include',
        },
        skipAuth: true,
      });

      if (data.accessToken) {
        login(data.accessToken);
      } else {
        throw new Error('로그인 응답에 accessToken이 없습니다.')
      }
      return data;
    },
    onSuccess: async () => {
      localStorage.setItem('isLoggedIn', 'true');
      await queryClient.invalidateQueries({
        queryKey: ['userInfo', 'nickname'],
      });
    },
  });
};

// 액세스 토큰 리프레시를 위한 커스텀 훅
export const useRefresh = () => {
  return useMutation({
    mutationFn: async () => {
      const data = await apiClient.post<AuthResponse>({
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
  const { showToast } = useToastMessageContext();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: () =>
      apiClient.delete({
        endpoint: '/auth/logout',
        options: { credentials: 'include' },
        skipAuth: true,
      }),
    onSuccess: () => {
      logout();
      localStorage.removeItem('isLoggedIn');
      // 로그아웃 시 전체 캐시 날리기
      queryClient.clear();
      showToast('로그아웃 되었습니다', true);
    },
    onError: () => {
      // UX를 위해 서버 실패와 무관하게 클라이언트 로그아웃 처리
      logout();
      localStorage.removeItem('isLoggedIn');
      queryClient.clear();
      showToast('로그아웃 되었습니다', true);
    }
  });
};
