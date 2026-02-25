import { AUTH_API } from '@/features/auth/constants';
import type {
  AuthResponse,
  CheckIdRequest,
  JoinRequest,
  LoginRequest,
} from '@/features/auth/types/authApi';
import { apiClient } from '@/shared/api/apiClient';

export const checkIdApi = (userData: CheckIdRequest) =>
  apiClient.post({
    endpoint: AUTH_API.ENDPOINTS.CHECK_ID,
    body: userData,
    skipAuth: true,
  });

export const signUpApi = (userData: JoinRequest) =>
  apiClient.post({
    endpoint: AUTH_API.ENDPOINTS.SIGNUP,
    body: userData,
    skipAuth: true,
  });

export const loginApi = (userData: LoginRequest) =>
  apiClient.post<AuthResponse>({
    endpoint: AUTH_API.ENDPOINTS.LOGIN,
    body: userData,
    options: { credentials: 'include' },
    skipAuth: true,
  });

export const logoutApi = () =>
  apiClient.delete({
    endpoint: AUTH_API.ENDPOINTS.LOGOUT,
    options: { credentials: 'include' },
    skipAuth: true,
  });

export const refreshApi = () =>
  apiClient.post<AuthResponse>({
    endpoint: AUTH_API.ENDPOINTS.REFRESH,
    options: { credentials: 'include' },
    skipAuth: true,
  });
