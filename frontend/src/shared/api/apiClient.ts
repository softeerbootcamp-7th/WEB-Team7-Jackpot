import { getAccessToken } from '@/shared/utils/getAccessToken';

// 환경 변수 속의 요청 주소 불러오기
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface methodProps {
  endpoint: string;
  body?: unknown;
  options?: RequestInit;
}

// 인터셉터 패턴처럼 fetch Wrapper
export const apiClient = {
  get: async ({ endpoint, options }: methodProps) => {
    return request(endpoint, { ...options, method: 'GET' });
  },
  post: async ({ endpoint, body, options }: methodProps) => {
    return request(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  put: async ({ endpoint, body, options }: methodProps) => {
    return request(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  patch: async ({ endpoint, body, options }: methodProps) => {
    return request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete: async ({ endpoint, options }: methodProps) => {
    return request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },
};

// fetch Wrapper 내부에서 사용하는 실제 요청 함수
const request = async (endpoint: string, options: RequestInit) => {
  const token = getAccessToken();

  // 헤더 설정
  const headers = new Headers(options.headers || {});

  // GET, DELETE에서는 Body가 없으므로 Content-Type이 필요가 없음
  // Body가 있는 요청에서만 JSON 헤더 설정
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', token);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
};
