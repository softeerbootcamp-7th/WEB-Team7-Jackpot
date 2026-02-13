const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function httpClient<T>(
  path: string,
  config?: RequestInit,
): Promise<T> {
  const storedToken = localStorage.getItem('accessToken');

  if (!storedToken) {
    throw new Error('Access Denied'); // 혹은 로그인 페이지로 리다이렉트
  }

  const token = `Bearer ${storedToken}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',

    ...config,

    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      ...config?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const text = await response.text();
  if (!text) {
    throw new Error(`Empty response body for ${path}`);
  }
  return JSON.parse(text) as T;
}
