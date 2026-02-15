import {
  getAccessToken,
  setAccessToken,
} from '@/features/auth/libs/tokenStore';

// 환경 변수 속의 요청 주소 불러오기
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface methodProps {
  endpoint: string;
  body?: unknown;
  params?: Record<string, unknown>;
  options?: RequestInit;
  skipAuth?: boolean;
  isStream?: boolean;
}

// 인터셉터 패턴처럼 fetch Wrapper
export const apiClient = {
  get: async ({
    endpoint,
    params,
    options,
    skipAuth,
    isStream,
  }: methodProps) => {
    const cleanParams: Record<string, unknown> = {};
    if (params) {
      for (const key in params) {
        const value = params[key];
        if (value !== null && value !== undefined) {
          cleanParams[key] = value;
        }
      }
    }
    const queryString =
      Object.keys(cleanParams).length > 0
        ? `?${new URLSearchParams(cleanParams as Record<string, string>).toString()}`
        : '';
    return request(
      `${endpoint}${queryString}`,
      { ...options, method: 'GET' },
      skipAuth,
      isStream,
    );
  },
  post: async ({ endpoint, body, options, skipAuth }: methodProps) => {
    return request(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      skipAuth,
    );
  },
  put: async ({ endpoint, body, options, skipAuth }: methodProps) => {
    return request(
      endpoint,
      {
        ...options,
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      skipAuth,
    );
  },
  patch: async ({ endpoint, body, options, skipAuth }: methodProps) => {
    return request(
      endpoint,
      {
        ...options,
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      },
      skipAuth,
    );
  },
  delete: async ({ endpoint, options, skipAuth }: methodProps) => {
    return request(
      endpoint,
      {
        ...options,
        method: 'DELETE',
      },
      skipAuth,
    );
  },
};

// fetch Wrapper 내부에서 사용하는 실제 요청 함수
const request = async (
  endpoint: string,
  options: RequestInit,
  skipAuth: boolean = false,
  // SSE 스트리밍 용도인지 파악하는 파라미터
  isStream: boolean = false,
) => {
  // 헤더 설정
  const headers = new Headers(options.headers || {});

  // GET, DELETE에서는 Body가 없으므로 Content-Type이 필요가 없음
  // Body가 있는 요청에서만 JSON 헤더 설정
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', token);
    }
  }

  try {
    let response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 액세스 토큰이 만료되었다면 리프레시 후 재요청하는 로직
    if (response.status === 401 && !skipAuth) {
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        // 리프레시 토큰마저 만료된 경우
        if (!refreshResponse.ok) {
          throw new Error('리프레시 토큰 만료');
        }

        const refreshData = await refreshResponse.json();

        setAccessToken(refreshData.accessToken);

        headers.set('Authorization', getAccessToken());

        response = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
      } catch (error) {
        console.error('리프레시 에러', error);
        throw error;
      }
    }

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // SSE 용도라면 파싱하지 않고 response 그대로 반환
    if (!isStream) {
      return response;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
};
