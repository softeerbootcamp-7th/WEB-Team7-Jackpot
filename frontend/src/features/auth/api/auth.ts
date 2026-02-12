import {
  getAccessToken,
  setAccessToken,
} from '@/features/auth/libs/tokenStore';
import type {
  AuthResponse,
  CheckIdRequest,
  JoinRequest,
  LoginRequest,
} from '@/features/auth/types/authApi';
import { apiClient } from '@/shared/api/apiClient';

export const authClient = {
  // 아이디 중복확인을 위한 메서드
  checkId: async (userData: CheckIdRequest): Promise<AuthResponse> => {
    return await apiClient.post({ endpoint: '/auth/checkid', body: userData });
  },

  // 회원가입을 위한 메서드
  signUp: async (userData: JoinRequest): Promise<AuthResponse> => {
    return await apiClient.post({ endpoint: '/auth/join', body: userData });
  },

  // 로그인을 위한 메서드
  login: async (userData: LoginRequest): Promise<AuthResponse> => {
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

  // 토큰 조회 메서드
  getToken: () => getAccessToken(),

  // 액세스 토큰 리프레시를 위한 메서드
  refresh: async (): Promise<AuthResponse> => {
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

  // [윤종근] - TODO: 추후에 로그아웃 구현 시 엑세스 토큰 비우는 메서드 추가 필요
};
