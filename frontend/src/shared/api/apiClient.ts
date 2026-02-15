import {
  getAccessToken,
  setAccessToken,
} from '@/features/auth/libs/tokenStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface MethodProps {
  endpoint: string;
  body?: unknown;
  options?: RequestInit;
  skipAuth?: boolean;
}

// 모듈 레벨에서 refresh Promise 공유 (race condition 방지)
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshResponse.ok) {
        throw new Error('Refresh token expired');
      }

      const refreshData = await refreshResponse.json();

      if (!refreshData.accessToken) {
        throw new Error('Invalid refresh response: missing accessToken');
      }

      setAccessToken(refreshData.accessToken);
      return refreshData.accessToken;
    } finally {
      refreshPromise = null; // 다음 리프레시 시 새 Promise 생성
    }
  })();

  return refreshPromise;
};

const request = async <T>(
  endpoint: string,
  options: RequestInit,
  skipAuth: boolean = false,
): Promise<T> => {
  const headers = new Headers(options.headers || {});

  // Body가 있는 요청만 JSON Content-Type 설정
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 인증 토큰 설정
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) headers.set('Authorization', token);
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // 액세스 토큰 만료 시 리프레시 후 재요청
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    headers.set('Authorization', newToken);
    response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  }

  // API 에러 처리
  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`API Error: ${response.status} ${errorBody}`);
  }

  const text = await response.text();
  if (!text) return null as unknown as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Failed to parse response as JSON (status: ${response.status}): ${text.slice(0, 200)}`,
    );
  }
};

export const apiClient = {
  get: async <T>({ endpoint, options, skipAuth }: MethodProps): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'GET' }, skipAuth),

  post: async <T>({
    endpoint,
    body,
    options,
    skipAuth,
  }: MethodProps): Promise<T> =>
    request<T>(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      skipAuth,
    ),

  put: async <T>({
    endpoint,
    body,
    options,
    skipAuth,
  }: MethodProps): Promise<T> =>
    request<T>(
      endpoint,
      {
        ...options,
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      skipAuth,
    ),

  patch: async <T>({
    endpoint,
    body,
    options,
    skipAuth,
  }: MethodProps): Promise<T> =>
    request<T>(
      endpoint,
      {
        ...options,
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      },
      skipAuth,
    ),

  delete: async <T = void>({
    endpoint,
    options,
    skipAuth,
  }: MethodProps): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'DELETE' }, skipAuth),
};
